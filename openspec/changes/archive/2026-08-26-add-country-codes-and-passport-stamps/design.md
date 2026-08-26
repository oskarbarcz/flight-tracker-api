## Context

See `proposal.md` — Why. What shapes the approach here is where country already lives:

- `Airport.country` is an unconstrained `String` holding an English name. Ten seeded airports carry
  six distinct names; production carries whatever SkyLink has produced since.
- `src/core/utils/country-name.ts` resolves an alpha-2 code to a name and is called in exactly one
  place — `SkyLinkClient.findAirportBy` — on the way in. Every name in the database is therefore
  either hand-seeded or ICU's English name for a code, which is what makes a reliable reverse
  mapping possible at all.
- Country names have been copied into places that are not airports: `UserStatsByAirport.country`,
  the manifest's `cargo-commodities.data.json` (`sources.countries`, 32 names), and
  `passenger-name.ts`'s `COUNTRY_LOCALES`, keyed by name.
- The statistics module derives everything by full recompute from flight facts
  (`computeProjections`), invalidating a fixed set of per-user cache keys.
- `report-on-block.command.ts` already resolves the true landing airport — the diversion airport
  when `isFlightDiverted`, otherwise the `destination` airport — and publishes it as
  `OnBlockWasReportedEvent.landingAirportId` via `emitAsync`.

## Goals / Non-Goals

**Goals:**

- One place that knows what a country is, imported rather than queried.
- A migration that cannot silently lose a country.
- Stamps that survive a replayed event and a diversion.
- The passport read from one source of truth, not a second projection to keep in step.

**Non-Goals:**

- Editing countries through the API. The catalogue is reference data.
- Deriving `Airport.continent` from the catalogue — see `proposal.md`, Impact.
- Reworking how airport visits are counted. `UserStatsByAirport` keeps counting every airport on a
  flight; the passport counts arrivals only, and the two are deliberately different measures.
- Localised country names. The catalogue is English, like every other name in the system.

## Decisions

### The catalogue is a checked-in data file, not a table and not a runtime ICU call

`src/modules/countries/data/countries.data.json` holds `{ code, name, continent }` per country;
`model/country.model.ts` exposes pure lookups over it (`findCountry`, `toCountryRef`,
`isKnownCountryCode`, `findCountryByName`) and derives the flag emoji from the code by mapping each
letter to its regional indicator symbol.

*Why not a table:* countries do not change on a schedule anyone operates, nothing joins to them in
SQL (the code is the join), and a table would drag in a migration, a seed loader, a repository and a
`GET` that can 404. The manifest module already holds its commodity catalogue this way.

*Why not call `Intl.DisplayNames` at runtime:* ICU data moves between Node versions, so the name for
a code could change under us — and because the stored value is the code, a drifting name is only a
display bug rather than data loss. Freezing the names in a file also means the reverse mapping used
by the migration is the same table that produced the names now in the database.

*Generation:* the file is generated once by a throwaway script that walks every assigned alpha-2
code through `Intl.DisplayNames`, applies the project override `US → United States of America`, and
excludes the user-assigned ranges. It is generated, then checked in and owned by hand.

### The system gains an `antarctica` continent so the catalogue can be complete

Every catalogue entry carries a continent, and `Continent` had six members with no Antarctica, so
`AQ` — an assigned code — had nowhere to sit. The enum gains `antarctica` and the catalogue carries
all 249 assigned codes.

*Alternative rejected:* omit `AQ` and document the omission. It was the smaller change, but it
contradicted this change's own rule — that only unassigned and user-assigned codes are refused —
and it left a dead end. An airport already recording the country name `Antarctica`, which the
deleted `toCountryName` would have produced for a real aerodrome such as NZWD, SCRM or NZFX, would
abort the migration with nothing to map to and no way forward.

*Consequences.* The migration adds the value with `ALTER TYPE ... ADD VALUE ... BEFORE 'asia'`,
which Postgres permits inside a transaction only because nothing in the same transaction uses the
new value. Rollback is the awkward half: Postgres cannot drop an enum value, so `down.sql` rebuilds
the type — renaming the old one, creating it afresh without `antarctica`, moving the three columns
across and dropping the original — behind a guard that aborts first if any row still claims it.

### Other modules import the catalogue directly, not over the bus

`toCountryRef(code)` is a pure function over a static file, so `airports`, `aircraft`, `flights`,
`manifest` and `statistics` import it. The bus rule exists to keep `PrismaService` out of the
application layer and to stop one module reading another's tables; neither applies to a constant.
There is precedent: `manifest/model/passenger-name.ts` already imports `Continent` from
`airports/model/airport.model.ts`.

### `country` becomes one shared `CountryRef` class

A single `CountryRef { code, name }` in `countries/model/` is reused by every DTO that exposes a
country, so the shape is defined once and Swagger documents it once. Repositories keep selecting the
bare `country` column; the mapping to `CountryRef` happens where the response is assembled.

*Alternative rejected:* a `countryName` sibling field. Two fields that must agree forever, and every
consumer would have to be told which one is authoritative.

### The migration maps names to codes and aborts on anything it cannot map

One migration, in this order, for `airport` and then `user_stats_by_airport`:

1. Build the name → code mapping as a `VALUES` list generated from the same catalogue file.
2. `DO $$ ... RAISE EXCEPTION $$` if any distinct `country` value fails to join it, naming the
   offending values.
3. `UPDATE` in place, then `ALTER COLUMN country TYPE VARCHAR(2)`.

The abort is the point. A `LEFT JOIN` with a `COALESCE` fallback would deploy cleanly and leave
airports holding a truncated two characters of prose, which nobody would notice until a passport
showed a country that does not exist.

`user_stats_by_airport` is a derived projection and could instead be left to the next recompute, but
that recompute only runs when its pilot next completes a flight — the column would hold names for
dormant pilots indefinitely. It costs one more `UPDATE` to migrate it with the same mapping.

### Stamps are an append-only log; the passport is a query over it

`user_country_visit` holds one row per arrival: `userId`, `country`, `flightId`, `airportId`,
`visitedAt`. Unique on `(userId, flightId)`, indexed on `(userId, country)`.

The passport read is a `GROUP BY country` over that log producing count, `MIN(visitedAt)` and
`MAX(visitedAt)`. Unlocked-in-period is the same `MIN` filtered to the period.

*Alternative rejected:* also maintaining a `UserStatsByCountry` aggregate. It would be a second
thing to keep in step with the log for a query that groups a handful of rows per pilot. If the
passport ever gets slow, the aggregate is a cache to add later, not a shape to commit to now.

### The stamp is written by a listener on arrival, not by the recompute

A `@OnEvent(FlightEventType.OnBlockWasReported)` listener in `statistics` dispatches
`StampCountryVisitCommand`, which resolves the landing airport's country through
`GetAirportByIdQuery` on the bus and inserts the stamp, ignoring a conflict on `(userId, flightId)`.

*Why not fold it into `RecomputeUserStatisticsCommand`:* the recompute derives from
`CaptainFlightFact`, which carries a flight's airports without their type and without any knowledge
of diversions. Deriving the true landing airport there would mean widening the fact query and
re-implementing the resolution `report-on-block.command.ts` has already done. The event hands us the
answer.

*Consequence:* stamps are append-only, so a flight deleted or re-flown after the fact leaves its
stamp behind. That matches a passport, and the unique constraint keeps a replay from adding a second
one.

### The stamp command invalidates its own cache key

Both the recompute listener and the stamp listener fire on the same event and run concurrently, so
adding the passport key to `userStatsCacheKeys` alone would let a read between the recompute's
invalidation and the stamp's write re-warm a passport missing its newest stamp. The stamp command
clears `STATS_COUNTRIES` after its own write.

### The per-country stamp read is not cached

`@CacheKey` sets a fixed key that ignores route parameters, so caching `/me/stats/countries/{code}`
under one key would serve one country's stamps for every code — and, per a known trap in this
codebase, would answer a warm `200` where a cold request validates and rejects. The passport list
takes `@CacheKey(CACHE_KEYS.STATS_COUNTRIES)`; the per-country read takes no cache.

### The backfill is SQL in the same migration

Stamps for already-completed flights insert from `flight` joined to its captain and to the effective
landing airport — `diversion.airportId` where a diversion exists, otherwise the `destination` row in
`airport_flight` — filtered to flights with a `completedAt` and a `captainId`. `ON CONFLICT DO
NOTHING` makes it re-runnable.

This is the reversible decision flagged in the proposal: the user asked to record countries "since
now". Backfilling was chosen because the history is already there, an empty passport on launch day
is a poor first impression, and dropping it later is deleting one SQL block. Nothing else in the
design depends on it.

### The feature suite is rewritten by script

245 assertions across 41 files change from `"country": "Germany"` to the object form. A checked-out
script does the substitution from the same catalogue mapping, so the tests cannot disagree with the
migration about what `Germany` maps to.

## Risks / Trade-offs

**A production airport holds a country name the catalogue cannot map** → The migration aborts and
the deploy fails, which is intended. Mitigation: run the mapping check as a read-only query against
production before deploying, so the failure is found in advance rather than in the middle of a
release.

**Breaking change for the desktop and web clients** → `country` stops being a string. Mitigation:
`GET /api/v1/country` ships in the same release, the shape is one shared class so the change is
mechanical on the client side, and the clients are in-house.

**A stamp write fails silently** → `@OnEvent` listeners log their throws rather than surfacing them,
so a failed stamp does not fail the flight. Accepted: statistics are derived data and a completed
flight matters more than its stamp. The backfill query doubles as the repair — re-running it inserts
whatever is missing.

**The passport disagrees with `geography.countries`** → The summary counts countries across every
airport visited; the passport counts arrivals only, so a pilot who has only ever departed from a
country appears in one and not the other. This is deliberate and the specs state both, but it is the
kind of difference that reads as a bug in the UI. Mitigation: the passport endpoint is the thing to
render as a passport; the summary count stays a count.

**Airports whose country and continent now disagree** → The catalogue assigns each country one
continent while the airport keeps its own. For Russia and Turkey these differ by design. Nothing
consumes the catalogue's continent for an airport, and nothing should start.

**Test-suite churn hides a real regression** → A 245-assertion diff is not reviewable line by line.
Mitigation: the substitution is mechanical and generated, and the full Cucumber suite plus the Jest
specs run before the change is called done.

## Migration Plan

1. Ship the `countries` module and the generated catalogue first — it is additive and nothing
   depends on it yet.
2. Run the read-only mapping check against production; resolve any unmapped country by hand before
   going further.
3. Deploy the schema migration: name → code for `airport` and `user_stats_by_airport`, the
   `user_country_visit` table, and the stamp backfill.
4. Deploy the API changes and the clients together, since the country shape breaks.

**Rollback:** the code rolls back cleanly — the catalogue can turn a code back into a name. The
schema does not: `VARCHAR(2)` has thrown the names away, so reverting means a down migration that
re-expands codes to names from the same catalogue. Write it alongside the up migration rather than
under pressure. `user_country_visit` drops without consequence. The `Continent` enum is the one part that cannot
simply be reversed — see "The system gains an `antarctica` continent" above.

**Local development:** after the schema change, `prisma db push` — `migrate deploy` fails with P3005
against the dev database — and reseed.

## Open Questions

- Whether the desktop client ships in lockstep with this release or lags it by one. It does not
  change the API, the specs or the task breakdown; it changes only whether the clients need a
  transitional release.
