## Context

See proposal.md — Why. What shapes the design is the current implementation's assumptions,
all of which this change invalidates:

- `airport_weather` is keyed by `airportId` alone, so the row *is* the airport's weather.
  `AirportWeatherRepository.saveWeather()` is a plain `update` on that key, and the read is a
  `findUnique`.
- `airport_weather.watch` doubles as monitoring state. `watchAirports()` upserts a row whose
  only purpose may be to carry `watch: true` — a weather record with no weather in it.
- `WeatherClient` is the only provider, and its interface (`fetchMetar(icaos[])`,
  `fetchTaf(icaos[])` returning `Map<icao, text>`) assumes one batched call per information
  type. It parses `text/plain` grouped by indentation.
- `RefreshWeatherHandler` awaits both fetches with `Promise.all` and has no error handling;
  the `@Cron` wrapper has none either. One upstream failure aborts the whole cycle.
- The read endpoint is `@SkipAuth()` and takes no query parameters, so it has never needed
  to know who is asking.

Two constraints from the codebase bound the solution. `PrismaService` is only ever injected
into repositories, so filter resolution and provider fan-out must sit in the application
layer with repositories underneath. And the Cucumber body assertion is an exact-key-count
deep compare, so a collection response with no ordering guarantee produces intermittent
failures — the suite already carries one such flake from the unordered `airports[]` on a
flight.

## Goals / Non-Goals

**Goals:**

- Make adding a third weather provider a change to one client plus one enum value, with no
  schema migration and no change to the read endpoint's shape.
- Keep a failing provider invisible to everything except the log: never a failed request,
  never an emptied report.
- Keep the read endpoint public while letting an identified user's stored preference select
  the source.
- Migrate existing weather without losing a report or a monitoring flag.

**Non-Goals:**

- Comparing or reconciling the two sources' METAR/TAF. The system stores both verbatim and
  lets the client decide; no "preferred source per field" logic, no diffing.
- Parsing any report into structured fields. `content` stays raw text for all three
  information types, ATIS included.
- Per-source refresh cadences, per-source monitoring sets, or backfilling weather for
  airports nobody is flying to.
- Storing SayIntentions' `comms[]` frequency list, or exposing frequencies anywhere.
- Weather history. One row per `(airport, source, informationType)`, overwritten in place.

## Decisions

### Tall table with a composite unique key, not history

`airport_weather` becomes `id` (uuid PK), `airportId`, `source`, `informationType`,
`content`, `lastFetched`, with `@@unique([airportId, source, informationType])` and a
`Cascade` FK on the airport. Refresh is an upsert on the composite key, so an airport
converges on at most five rows forever.

The alternative was append-only history, which the response's `id` field hints at. Rejected:
at a 5-minute cadence it is ~288 rows per airport per day, every read needs a per-key latest
selection, and it needs a retention policy — all to serve a use case (METAR trends, ATIS
letter progression) nobody has asked for. `id` is kept in the response anyway because it
gives a client a stable key for list rendering, and because reintroducing it later would be
a breaking change.

Keeping the wide table and adding `siMetar`/`siTaf`/`siAtis` columns was also considered and
is what this change exists to avoid: it encodes the provider in the schema, so the third
provider is another migration and another three response fields.

### Monitoring moves to `airport.monitorWeather`, staying system-managed

The flag becomes a plain boolean on `airport`, backfilled from `airport_weather.watch`. This
drops the placeholder-row upsert: check-in now just flips a flag on rows that already exist,
and the refresh selects airports with `where: { monitorWeather: true }` instead of joining
through the weather table to reach `icaoCode`.

Sitting on `airport` next to `dataQuality`, the flag *looks* like configuration, so the
decision to keep it system-managed is deliberate and needs enforcing rather than assuming:
it is absent from `UpdateAirportDto`, and the global validation pipe runs with
`forbidNonWhitelisted: true`, so a client that sends it gets a `400` with the field named in
`violations` rather than a silently ignored property. The
alternative — letting ops pin hub airports — was rejected for now because on-block clearing
would clobber a manual pin, which needs a tri-state (`off | pinned | active-flight`) rather
than a boolean. That is a coherent future change; it is not this one.

Ownership splits along the table: `AirportsRepository` gains `listMonitored()`,
`startMonitoring(airportIds)` and `stopMonitoring(airportIds)`;
`AirportWeatherRepository` keeps only report rows. Both monitoring commands take airport ids,
so the pair is symmetric; the on-block listener reads them off the event, which now carries
`airportIds` the way `PilotCheckedInEvent` already did. The shared-active-flight rule keeps
any airport still referenced by a flight in an active status, and needs no explicit exclusion
of the reporting flight: `ReportOnBlockHandler` persists the `OnBlock` status before it emits,
so that flight is already outside the active set by the time the listener runs.

### Two clients behind one refresh command, fanned out per source

`SayIntentionsClient` is a new provider under `src/core/provider/sayintentions/`, fetching
`GET {host}/api/mep/getWX?icao={icao}` through `fetchWithRetry` and returning
`{ metar?, taf?, atis? }` for one airport. It does not implement the existing
`WeatherClient` interface, because the two upstreams have genuinely different shapes — one
batched call for N airports versus one call per airport — and forcing a common interface
would mean either faking batching in SayIntentions (a loop hidden behind a plural method) or
faking per-airport calls in aviationweather.gov (N times the requests). `RefreshWeatherHandler`
holds both clients and owns the difference:

```
RefreshWeatherCommand(airportIds?)
  │
  ├─ airports = airportIds ? getIcaoCodes(ids) : listMonitored()
  │
  ├─ aviation_weather_gov ─▶ fetchMetar(all icaos) ┐ 2 requests
  │                         fetchTaf(all icaos)    ┘
  │                              └─▶ upsert (airport, agov, metar|taf)
  │
  └─ say_intentions ──────▶ per airport: getWX(icao)   N requests
                                 └─▶ upsert (airport, si, metar|taf|atis)
```

Both branches run concurrently; within the SayIntentions branch, per-airport requests are
issued with bounded concurrency rather than an unbounded `Promise.all`, so a 40-airport
monitoring set does not open 40 sockets at once.

A partial answer is stored partially: if SayIntentions returns a METAR and an ATIS but no
TAF, the two present reports are upserted and the absent one is left exactly as it was
rather than blanked. This mirrors what `RefreshWeatherHandler` already does with `undefined`
today, and it is what makes a degraded upstream harmless.

### Failure isolation is per source and per airport

Every unit of work is wrapped so that a rejection is logged and swallowed:
`Promise.allSettled` at the source level, and per airport inside the SayIntentions branch.
The `@Cron` entry point gets a catch as well, since an unhandled rejection there is currently
invisible. Nothing about a failed fetch touches storage — no empty string, no bumped
`lastFetched` — so a client can always tell stale data from missing data by reading
`lastFetched`.

This matters more than it did: the request count per cycle goes from a fixed 2 to `2 + N`
against two independent vendors, so the probability that *something* fails in a given cycle
approaches certainty as the monitoring set grows. Isolation is what keeps that a non-event.

### Filter resolution lives in the query handler

The action parses `?source` into a `WeatherSourceFilter` (`user_default | all |
aviation_weather_gov | say_intentions`) via a small request DTO with `@IsEnum` +
`@IsOptional`, and reads the optional authenticated user the way `ListFlightsAction` does:
`@SkipAuth()` plus `@Req() request: AuthorizedRequest`, where `request.user` may be
undefined. It passes both to `GetAirportWeatherQuery(airportId, filter, userId?)`.

The handler resolves the filter to zero or one concrete `WeatherSource`:

```
user_default + userId  ─▶ GetUserWeatherSourceQuery(userId) ─▶ that source
user_default + no user ─▶ aviation_weather_gov
all                    ─▶ undefined  (no source predicate)
named source           ─▶ that source
```

The profile lookup crosses modules, so it goes over the query bus to a new
`GetUserWeatherSourceQuery` owned by `users`, alongside the existing
`GetUserSimbriefIdQuery` — the airports module never reads the `user` table.

Two enums are deliberately kept distinct: `WeatherSource` (the Prisma enum, and the type of
`user.defaultWeatherSource`) versus `WeatherSourceFilter` (an API-layer enum that adds
`user_default` and `all`). A single merged enum would make `all` a storable preference and a
storable row value, which is meaningless for a row. Because the Prisma enum values are
snake_case like every other enum in the schema, the two overlapping members share identical
spelling and the "mapping" between filter and column is the identity function on those
members.

### Deterministic ordering by enum declaration order

Reads use `orderBy: [{ source: 'asc' }, { informationType: 'asc' }]`. Postgres sorts enums
by declaration order, so declaring `WeatherSource` as `aviation_weather_gov, say_intentions`
and `WeatherInformationType` as `atis, metar, taf` fixes the response order as
`agov/metar, agov/taf, si/atis, si/metar, si/taf`. This is a spec requirement, not a
convenience: the functional suite's exact deep-compare turns any nondeterminism into an
intermittent failure.

### `defaultWeatherSource` follows `simbriefUserId` exactly

`UsersRepository.returnWithoutPassword()` is an explicit field whitelist, not a spread, so
adding a column leaks it into no response by default. `simbriefUserId` is already the
established pattern for an own-user-only field: omitted from `GetUserDto`, re-added by hand
in `findOwnById()`. `defaultWeatherSource` is added the same way — `OmitType(User, ['password',
'simbriefUserId', 'defaultWeatherSource'])` for the administrative DTO, explicit re-add in
`findOwnById()`, and a field on `UpdateOwnProfileDto` validated with `@IsEnum(WeatherSource)`
so `all` is rejected at the edge.

The existing profile-update cache invalidation covers this for free: `GET /user/me` is
already made fresh after a profile update, and the pilot card (which does not carry the new
field) is unaffected.

## Risks / Trade-offs

- **The read endpoint's response now depends on who is asking, and there is no cache on it
  today.** → If a `CacheInterceptor` is ever added to `GetWeatherAction`, keying by URL alone
  will serve one user's source preference to another. This is recorded as a constraint in
  the spec rather than tribal knowledge; any future cache must include the resolved source
  in the key.
- **`2 + N` upstream requests every 5 minutes against a provider whose rate limits are
  unknown.** → Bounded concurrency in the SayIntentions branch, `fetchWithRetry` for
  transient failures, and per-airport isolation so a `429` degrades one airport rather than
  the cycle. If limits turn out to be tight, the lever is the cron interval for that branch,
  not the architecture.
- **Reshaping a table is not reversible by rerunning the migration backwards.** → See
  Migration Plan. The forward migration is data-preserving and the down path is a restore,
  not an `ALTER`.
- **The response is breaking for every existing client of the weather endpoint.** → Accepted:
  the shape change is the point of the change, and the endpoint has one shape of consumer
  (the flight briefing view) rather than many.
- **Two sources disagreeing about the same airport is now visible to users.** → Accepted and
  specified: content is stored verbatim per source, and a client that wants one answer asks
  for one source. The system does not arbitrate.
- **Storing ATIS as unparsed prose means the information letter is not queryable.** → Accepted
  for now. Extracting it would need a rule for phrasing the provider has not committed to; if
  it becomes necessary, it is an additive column derived from `content`, not a reshape.

## Migration Plan

One forward migration, ordered so nothing reads a column that does not exist yet:

1. Create `WeatherSource` and `WeatherInformationType`, with members declared in the order
   that the response ordering depends on.
2. `ALTER TABLE "airport" ADD COLUMN "monitorWeather" boolean NOT NULL DEFAULT false`, then
   backfill from `airport_weather.watch`.
3. `ALTER TABLE "user" ADD COLUMN "defaultWeatherSource" "WeatherSource" NOT NULL DEFAULT
   'aviation_weather_gov'`. The default backfills every existing row, and keeping the default
   on the column means new users need no application-side write.
4. Create the new `airport_weather` shape, then populate it from the old one with two
   `SELECT`s unioned — one per legacy column pair — each filtered to `IS NOT NULL` and
   attributed to `aviation_weather_gov`. `lastFetched` is `NOT NULL` while the legacy
   timestamps are nullable, so it is `COALESCE(<legacy timestamp>, NOW())`.
5. Drop the old table and rename, adding the unique index and the airport FK.

A row whose `metar` and `taf` are both null — a placeholder created purely to carry
`watch: true` — correctly produces zero report rows; its monitoring state has already been
preserved by step 2. A row with text but a null timestamp produces a report dated at
migration time, which reads as "fetched, staleness unknown" and is corrected by the next
refresh cycle within 5 minutes.

**Rollback:** restore from backup. Step 5 drops the only copy of the legacy columns, so
there is no `ALTER`-based down path once it runs. Steps 1–4 are additive and safe to leave in
place. If a staged rollout is wanted, steps 1–4 can ship and run ahead of step 5 while the
application still reads the old table, making step 5 the only irreversible moment.

**Local development:** the dev database is brought forward with `prisma db push` (a
`migrate deploy` against this database fails with P3005), and the functional suite only
truncates and reseeds, so the seed fixtures must be updated in the same change or the suite
will assert against a schema the seed cannot fill.
