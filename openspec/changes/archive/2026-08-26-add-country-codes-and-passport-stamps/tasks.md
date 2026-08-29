## 1. The country catalogue

- [x] 1.1 Write a throwaway generator that walks every assigned ISO 3166-1 alpha-2 code through `Intl.DisplayNames('en', { type: 'region' })`, applies the `US → United States of America` override, excludes the user-assigned ranges (`AA`, `ZZ`, `QM`–`QZ`, `XA`–`XZ`), assigns each country its continent, and emits `src/modules/countries/data/countries.data.json` as `{ code, name, continent }` entries
- [x] 1.2 Check the generated `countries.data.json` in and delete the generator — the file is owned by hand from here
- [x] 1.3 Create `src/modules/countries/model/country.model.ts`: the `Country` and `CountryRef` API classes, and the pure lookups `findCountry`, `toCountryRef`, `isKnownCountryCode`, `findCountryByName`, plus flag-emoji derivation from the code via regional indicator symbols
- [x] 1.4 Add `src/modules/countries/model/country.model.spec.ts` covering: a code resolves to name and flag, letter case is normalised, a user-assigned code is unknown, `findCountryByName` round-trips every catalogue name, and the catalogue holds no duplicate code or name
- [x] 1.5 Create `src/modules/countries/model/error/country.error.ts` with `UnknownCountryCodeError extends BadRequestError`
- [x] 1.6 Create `ListCountriesQuery`/handler returning the catalogue, and `src/modules/countries/infra/http/action/list-countries.action.ts` serving `GET /api/v1/country`
- [x] 1.7 Create `countries.module.ts` registering the action and the handler, and add it to `AppModule`

## 2. Airport stores and reports a country code

- [x] 2.1 Change `Airport.country` in `schema.prisma` to `String @db.VarChar(2)`, and `UserStatsByAirport.country` likewise
- [x] 2.2 Change `Airport.country` in `src/modules/airports/model/airport.model.ts` to a `CountryRef` on the response side, with the request side validating a catalogue code (case-insensitive, stored upper case) and rejecting a name, a wrong length or an unknown code
- [x] 2.3 Map the stored code to `CountryRef` wherever an airport response is assembled in the `airports` module — list, single airport, create and update
- [x] 2.4 Update `get-airport-country-by-iata-code.query.ts` to return the code, and check each of its callers still reads what it expects
- [x] 2.5 Update the airports repository and its selects for the narrowed column

## 3. Provider and downstream reference data

- [x] 3.1 Remove the `toCountryName` call from `SkyLinkClient.findAirportBy` so the provider's code is stored as given, and reject a code the catalogue does not recognise with an error naming the value
- [x] 3.2 Delete `src/core/utils/country-name.ts` and `country-name.spec.ts`, folding the user-assigned-range rule into the catalogue's `isKnownCountryCode`
- [x] 3.3 Re-key `sources.countries` in `src/modules/manifest/data/cargo-commodities.data.json` from the 32 names to their codes, by script, using the catalogue mapping
- [x] 3.4 Update `manifest/model/commodity-selection.ts` and its spec so the country tier matches on the departure airport's code
- [x] 3.5 Re-key `COUNTRY_LOCALES` in `manifest/model/passenger-name.ts` to codes and update `passenger-name.spec.ts`
- [x] 3.6 Update `manifest/application/command/reconcile-flight-cargo-manifest.command.ts` where it passes the departure country
- [x] 3.7 Map to `CountryRef` in the remaining response paths: `aircraft/infra/http/request/aircraft.request.ts` (`AircraftAirport`), the airport selects in `flights.repository.ts`, `diversion.repository.ts` and `aircraft.repository.ts`, and `MostVisitedAirport` in `statistics/model/statistics.model.ts`

## 4. Migrating the stored names

- [x] 4.1 Write the read-only mapping check — the distinct `airport.country` values that fail to join the catalogue mapping — and run it against the dev database
- [x] 4.2 Write the migration: the name → code `VALUES` mapping generated from the catalogue, a `DO $$ ... RAISE EXCEPTION $$` guard naming any unmapped value, the in-place `UPDATE` for `airport` and `user_stats_by_airport`, then `ALTER COLUMN ... TYPE VARCHAR(2)` on both
- [x] 4.3 Write the matching down migration that re-expands codes to names from the same mapping
- [x] 4.4 Apply the schema locally with `prisma db push` (not `migrate deploy`, which fails P3005 against the dev database) and regenerate the Prisma client

## 5. The stamp log

- [x] 5.1 Add `UserCountryVisit` to `schema.prisma` — `userId`, `country` (`VarChar(2)`), `flightId`, `airportId`, `visitedAt` — unique on `(userId, flightId)`, indexed on `(userId, country)`, mapped to `user_country_visit`, cascading from `User`
- [x] 5.2 Add the table to the same migration, plus the backfill insert: `flight` joined to its captain and to the effective landing airport (`diversion.airportId` where a diversion exists, otherwise the `destination` row in `airport_flight`), filtered to flights holding a `completedAt` and a `captainId`, with `ON CONFLICT DO NOTHING`
- [x] 5.3 Create `statistics/infra/database/user-country-visit.repository.ts` with the insert-ignoring-conflict, the grouped passport read, the per-country stamp read, and the per-country first-visit read used by the period stats
- [x] 5.4 Create `StampCountryVisitCommand`/handler in `statistics/application/command/`: resolve the landing airport's country through `GetAirportByIdQuery` on the bus, insert the stamp, then clear the passport cache key
- [x] 5.5 Create `statistics/application/event/external/country-visit.listener.ts` on `FlightEventType.OnBlockWasReported`, dispatching the command for the flight's captain and doing nothing when there is no captain
- [x] 5.6 Add `country-visit.listener.spec.ts` covering: an international arrival stamps the arrival country only, a domestic sector stamps once, a diversion stamps where the aircraft landed, a repeated event does not double-stamp, and a captainless flight stamps nothing

## 6. Reading the passport

- [x] 6.1 Add `STATS_COUNTRIES` to `CACHE_KEYS` and include it in `userStatsCacheKeys`
- [x] 6.2 Add the passport response classes to `statistics/model/statistics.model.ts` — a country entry (`CountryRef`, flag, visits, first and last visit) and a stamp entry (airport, flight, moment)
- [x] 6.3 Add `CountryNotVisitedError extends NotFoundError` to `statistics/model/error/statistics.error.ts`
- [x] 6.4 Create `GetMyCountriesQuery`/handler returning the passport grouped by country, ordered by first visit ascending, empty for a pilot who has flown nothing
- [x] 6.5 Create `GetMyCountryStampsQuery`/handler returning one country's stamps most recent first, rejecting an unknown code as a validation error and a never-entered known country as not found
- [x] 6.6 Create `get-my-countries.action.ts` for `GET /api/v1/user/me/stats/countries` with `@CacheKey(CACHE_KEYS.STATS_COUNTRIES)` and the user-aware interceptor
- [x] 6.7 Create `get-my-country-stamps.action.ts` for `GET /api/v1/user/me/stats/countries/{code}` with no cache, since `@CacheKey` ignores route parameters
- [x] 6.8 Register both handlers in the statistics module's `providers` and both actions in its `controllers`, along with the listener, command handler and repository

## 7. Countries unlocked in a period

- [x] 7.1 Extend `PeriodUnlocked` in `statistics/model/statistics.model.ts` with the unlocked countries
- [x] 7.2 Extend `get-period-stats.query.ts` to report the countries whose first stamp falls inside each period, empty list where none
- [x] 7.3 Extend the period projection spec coverage for a first entry, a re-entry and a purely domestic period

## 8. Seed and test suite

- [x] 8.1 Convert the six country names in `prisma/seed/resource/airports.seed.ts` to codes
- [x] 8.2 Seed `user_country_visit` rows consistent with the seeded completed flights and their captains, using real v4 UUIDs
- [x] 8.3 Write the substitution script that rewrites the 245 `"country": "..."` assertions across the 41 feature files into the object form, driven by the same catalogue mapping, and run it
- [x] 8.4 Add `features/country/country.list.feature` covering the catalogue read, with the defensive RBAC set — admin 200, cabin crew 200, unauthenticated 401
- [x] 8.5 Add `features/statistics/statistics.countries.get.feature` for the passport, asserting whole response bodies, with the same RBAC set
- [x] 8.6 Add `features/statistics/statistics.country-stamps.get.feature` for the per-country stamps, covering a visited country, an unknown code, a never-entered country, and the RBAC set
- [x] 8.7 Extend `features/flight/actions/flight.report-on-block.feature` with the stamp written on arrival, and the diversion feature with the stamp following the diversion
- [x] 8.8 Extend `features/statistics/statistics.summary.get.feature` and the period feature for the country code counting and the unlocked countries
- [x] 8.9 Reconcile the scenarios against the seed and the side effects statically before running the suite

## 9. Verify

- [x] 9.1 `docker compose exec app npx jest --runInBand` — `npm test` OOMs the container
- [x] 9.2 `docker compose exec app npm run test:functional`
- [x] 9.3 `docker compose exec app npm run lint` and `format:fix`, reverting the three unrelated feature files Prettier churns
- [x] 9.4 Check the Swagger output at `/api`: `CountryRef` documented once, the closed-set strings carrying `enum:`, the nullable dates carrying an explicit `type:`
- [x] 9.5 Update `openspec/specs/` prose that describes country as a name, and confirm `openspec validate add-country-codes-and-passport-stamps --strict` still passes

## 10. The antarctica continent

- [x] 10.1 Add `antarctica` to the `Continent` enum in `schema.prisma` and to the `Continent` enum in `airports/model/airport.model.ts`
- [x] 10.2 Add `AQ` to `countries.data.json`, bringing the catalogue to all 249 assigned codes, and cover it in `country.model.spec.ts`
- [x] 10.3 Add `ALTER TYPE "Continent" ADD VALUE 'antarctica' BEFORE 'asia'` to the migration, and rebuild the type without it in `down.sql` behind a guard that aborts if any row still claims it
- [x] 10.4 Fill the exhaustive `Record<Continent, ...>` map of passenger-name locales, and correct `import-airport-by-icao.command.ts`, which mapped the `Antarctica/*` timezone area to `oceania`
- [x] 10.5 Update the continent validation message asserted in `airport.create.feature` and `airport.list.feature`
