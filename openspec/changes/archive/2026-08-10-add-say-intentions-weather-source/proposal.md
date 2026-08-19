## Why

`airport-weather` was built around a single upstream, aviationweather.gov, and its storage
shape says so: one row per airport with a `metar` column, a `taf` column, and a timestamp
for each. That shape cannot hold the same report from two providers, and it cannot hold a
report type the original provider does not publish.

SayIntentions publishes both — a second opinion on METAR and TAF, and an **ATIS** that
aviationweather.gov has no equivalent for. ATIS is what a pilot actually listens to before
calling for clearance: the active runways, the transition level, the information letter to
quote on initial contact. It is the most operationally useful text of the three, and today
there is nowhere to put it.

Adding it as a third pair of columns would not work either. The columns encode the
provider, so a second provider doubles the width every time one is added, and the read
endpoint would grow a field per provider-and-type combination. The fix is to store one row
per report and describe each row by its source and information type. That turns adding a
provider from a schema change into a data change.

## What Changes

- **BREAKING** `airport_weather` is reshaped from one wide row per airport into a
  collection: one row per `(airport, source, information type)`, holding `content` and
  `lastFetched`. The `metar`, `metarLastUpdate`, `taf` and `tafLastUpdate` columns are
  removed. Existing rows are migrated — each contributes up to two rows, attributed to
  `aviation_weather_gov`.
- Add the `WeatherSource` enum (`aviation_weather_gov`, `say_intentions`) and the
  `WeatherInformationType` enum (`atis`, `metar`, `taf`).
- **BREAKING** `airport_weather.watch` is removed and replaced by `airport.monitorWeather`,
  backfilled from it. The flag stays system-managed exactly as before — set when a pilot
  checks in, cleared on on-block unless another active flight still references the airport
  — but it no longer requires creating a placeholder weather row just to carry a boolean,
  and it is not settable through any endpoint.
- Add a SayIntentions provider that fetches `GET /api/mep/getWX?icao=<icao>` and stores the
  `metar`, `taf` and `atis` it returns. It is fetched for the same set of airports as
  aviationweather.gov — those with `monitorWeather` set — on the same schedule and at the
  same check-in trigger.
- **BREAKING** `GET /api/v1/airport/:airportId/weather` returns an **array** of
  `{ id, source, informationType, content, lastFetched }` instead of a single object. An
  airport with no stored reports returns `200` with `[]`; only an unknown airport is `404`,
  matching `GET /api/v1/airport/:airportId/notam`. `AirportWeatherNotFoundError` is removed.
- Add `?source` to that endpoint, accepting `user_default` (the default), `all`,
  `aviation_weather_gov`, or `say_intentions`. `user_default` resolves to the requesting
  user's `defaultWeatherSource`; because the endpoint is public, an unauthenticated
  request resolves to `aviation_weather_gov`.
- Add `user.defaultWeatherSource`, a `WeatherSource` defaulting to `aviation_weather_gov`
  for every existing and new user. It is visible on `GET /api/v1/user/me` and settable
  through `PATCH /api/v1/user/me`, following `simbriefUserId` — a personal preference that
  is neither readable nor writable through the administrative user endpoints.

Coverage is deliberately asymmetric, and the filter exists because of it:

|                        | `metar` | `taf` | `atis` | upstream call pattern               |
| ---------------------- | ------- | ----- | ------ | ----------------------------------- |
| `aviation_weather_gov` | yes     | yes   | —      | one batched call for all ICAO codes |
| `say_intentions`       | yes     | yes   | yes    | one call per ICAO code              |

So a fully populated airport holds five reports, `?source=say_intentions` returns at most
three, and `?source=aviation_weather_gov` at most two. The two providers also format the
same report differently — SayIntentions omits the leading `METAR` token that
aviationweather.gov includes. Content is stored verbatim as received; the system does not
normalise between sources, because the value of a second source is seeing what it actually
said.

Two things the SayIntentions payload carries are deliberately **not** stored. Its `comms[]`
array of ATIS/TWR/GND/APP/CLR/FIS frequencies is airport reference data rather than
weather, and belongs to a change of its own. Its ATIS information letter ("information
Sierra") is left inside `content` rather than parsed into a column, because the phrasing is
prose and any extraction rule would be a guess about a format the provider has not
committed to.

## Capabilities

### New Capabilities

- _None._ SayIntentions is a second provider behind requirements that `airport-weather`
  already owns, not a new capability. The provider client is infrastructure, the way the
  existing `WeatherClient` is.

### Modified Capabilities

- `airport-weather`: every requirement changes. The read endpoint returns a filtered
  collection rather than one object and no longer 404s on an empty result; storage becomes
  one row per source and information type instead of one row per airport; monitoring moves
  from the weather record to the airport; and the scheduled refresh and check-in fetch now
  cover two providers with independent failure.
- `user-profile-self-service`: the set of fields a user may update, and the set visible
  only to the account holder, both gain `defaultWeatherSource`.

## Impact

- **Schema/migration:** two new enums; `airport.monitorWeather` backfilled from
  `airport_weather.watch`; `user.defaultWeatherSource` defaulted to
  `aviation_weather_gov`; `airport_weather` reshaped to `id`/`airportId`/`source`/
  `informationType`/`content`/`lastFetched`, unique on
  `(airportId, source, informationType)`, with existing METAR and TAF text migrated across.
  `Airport.weather` becomes a to-many relation. `lastFetched` is `NOT NULL`, so the
  migration coalesces the nullable legacy timestamps.
- **New `sayintentions` provider** under `src/core/provider/`: client, types and module,
  fetching through `fetchWithRetry` like every other provider. New `SAY_INTENTIONS_API_HOST`
  config key, a `sayintentions-mock` service in `compose.yaml`, and a
  `docker/mock/sayintentions.json` fixture matching on the `icao` query parameter the way
  `simbrief.json` matches on `userid`.
- **`airports` module:** `AirportWeatherRepository` rewritten for the collection shape with
  upsert-by-key and a deterministic order; `AirportsRepository` gains the monitoring flag
  operations; `RefreshWeatherCommand` fans out across both providers with per-provider and
  per-airport failure isolation; the watch/unwatch commands move to monitoring vocabulary
  and write to `airport`; `GetAirportWeatherQuery` resolves the source filter and returns a
  list; `GetWeatherAction` accepts `?source` and reads the optional authenticated user;
  `AirportWeatherNotFoundError` deleted.
- **`users` module:** `defaultWeatherSource` on the own-user read path and
  `UpdateOwnProfileDto`. The administrative user responses are unaffected — they are built
  from an explicit field whitelist that the new column is not added to.
- **Seed:** `weather.seed.ts` rewritten as per-source rows across both providers,
  `monitorWeather` on the airport fixtures, and one existing seed user defaulted to
  `say_intentions` so the `user_default` resolution is observably different between users.
- **Functional tests:** `features/airport/weather/airport.get-weather.feature` rewritten for
  the collection shape, plus coverage of every `?source` value including the authenticated
  and anonymous readings of `user_default`; the own-user assertions in `user.me.feature`,
  `user.me.update.feature` and `user.me.change-email.feature` gain the new field, and
  `user.me.update.feature` gains a scenario setting the preference.
- **API consumers:** the weather endpoint's response type changes from object to array and
  every field in it is renamed or removed. Any client reading `metar`/`taf` directly breaks
  and must be updated in step.
