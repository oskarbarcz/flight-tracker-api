## 1. Country name resolution helper

- [x] 1.1 Add `src/core/utils/country-name.ts` exporting `toCountryName(countryCode: string): string`, backed by a module-level `new Intl.DisplayNames(['en'], { type: 'region', fallback: 'none' })` (Node 24 ships full ICU, so no dependency is needed).
- [x] 1.2 Trim and upper-case the input, and return it unchanged when it is not exactly two characters — this is what makes an already-resolved name (`Germany`) pass through and the function idempotent.
- [x] 1.3 Add the `COUNTRY_NAME_OVERRIDES` map consulted before ICU, holding the project's canonical wording where it differs. One entry today: `US -> 'United States of America'` (ICU says "United States"; `prisma/seed/resource/airports.seed.ts` says "United States of America").
- [x] 1.4 Add `isUserAssignedCode` and reject `AA`, `ZZ`, `QM`–`QZ` and `XA`–`XZ` before consulting ICU, because ICU resolves `ZZ` to "Unknown Region" and `XA` to "Pseudo-Accents" — placeholder strings that must never be persisted as a country.
- [x] 1.5 Return the input unchanged when `regionNames.of(code)` yields `undefined` or throws, so the function is total.

## 2. Apply resolution at the provider boundary

- [x] 2.1 In `src/core/provider/skylink/client/skylink.client.ts`, have the private `findAirportBy` return `{ ...airport, country: toCountryName(airport.country) }`. This is the single point where a provider country code enters the system, so both `getAirportByIataCode` and `getAirportByIcaoCode` — and therefore both the import command and the passthrough endpoint — get names.
- [x] 2.2 Leave `ImportAirportByIcaoHandler.toRequest` in `src/modules/airports/application/command/import-airport-by-icao.command.ts` copying `airport.country` verbatim; the value reaching it is already resolved. No change to that file.
- [x] 2.3 Update `country` in `src/modules/skylink/dto/airport.dto.ts`: the description no longer says "Two-letter code" and the example is `Germany` instead of `DE`, reflecting the changed contract of `GET /api/v1/skylink/airport/:iataCode`.

## 3. Country name unit tests

- [x] 3.1 Add `src/core/utils/country-name.spec.ts` with six cases: plain resolution (`GB`, `DE`, `PL`, `FR`, `CA`, `IS`); the `US` override; lowercase and space-padded input (`de`, `' gb '`); unresolvable input (`QQ`, empty string) returned unchanged; the user-assigned placeholders (`ZZ`, `XA`, `AA`, `QZ`) returned unchanged rather than resolved to ICU labels; and idempotency on values that are already names.

## 4. Country name test-expectation updates

- [x] 4.1 `features/skylink/skylink.get-airport.feature`: the passthrough response's `country` becomes `United Kingdom` instead of `GB`.
- [x] 4.2 `features/flight/management/flight.create-with-simbrief.feature`: both asserted imported-airport bodies change `"country": "GB"` to `"country": "United Kingdom"`, which removes the `GB`-next-to-`Germany` inconsistency that made the defect visible.

## 5. Data quality persistence

- [x] 5.1 Add `enum DataQuality { low high flagship }` to `prisma/schema.prisma`.
- [x] 5.2 Add `dataQuality DataQuality @default(low)` to `model Airport` in `prisma/schema.prisma`, camelCase to match every other column in the file (the request's `data_quality` spelling was not adopted — see design decision 6).
- [x] 5.3 Add `prisma/migrations/20260730120000_add_airport_data_quality/migration.sql`: `CREATE TYPE "DataQuality"` then `ALTER TABLE "airport" ADD COLUMN "dataQuality" "DataQuality" NOT NULL DEFAULT 'low'`. No backfill — the default grades every existing row.
- [x] 5.4 Leave `prisma/seed/resource/airports.seed.ts` untouched, so every seeded airport is `low` by the column default.

## 6. Data quality in the airport model

- [x] 6.1 Add the domain `enum DataQuality { Low = 'low', High = 'high', Flagship = 'flagship' }` to `src/modules/airports/model/airport.model.ts`, mirroring the Prisma enum next to `Continent` (domain code never imports enums from `prisma/client`).
- [x] 6.2 Add `dataQuality?: DataQuality` to the `Airport` class with `@IsOptional() @IsEnum(DataQuality)` and an `@ApiProperty({ enum: DataQuality, required: false })` whose description states that the grade defaults to `low` and that this is where a SkyLink import starts. Optional so `POST /api/v1/airport` need not supply it; the column is `NOT NULL`, so responses always carry a value.
- [x] 6.3 Confirm no change is needed in `src/modules/airports/infra/http/request/airport.dto.ts` for create/update: `CreateAirportRequest = OmitType(Airport, ['id'])` and `UpdateAirportResponse = PartialType(CreateAirportRequest)` pick the field up automatically, so the existing Operations-gated `PATCH /api/v1/airport/:id` can edit the grade with no new endpoint.

## 7. Data quality in read projections

- [x] 7.1 Add `dataQuality: true` to `selectAirport` in `src/modules/airports/infra/database/airports.repository.ts`.
- [x] 7.2 Add `dataQuality: true` to the full airport select in `src/modules/flights/infra/database/repository/flights.repository.ts`, since flight responses embed the whole airport shape (and aircraft/statistics responses reuse it).
- [x] 7.3 Add `dataQuality: true` to the trimmed airport projection in `src/modules/flights/infra/database/repository/diversion.repository.ts` as well, so every airport the API exposes carries the grade. It was left out at first; the suite failed on `features/flight/diversion/flight.get-diversion.feature` because one diversion body asserted the field and the projection did not return it. That projection still omits `shape`.

## 8. Filtering by data quality

- [x] 8.1 Add `dataQuality?: DataQuality` with `@IsEnum(DataQuality) @IsOptional()` and `@ApiProperty({ required: false, enum: DataQuality })` to `AirportListFilters` in `src/modules/airports/infra/http/request/airport.dto.ts`, next to the existing `continent` filter.
- [x] 8.2 Add `dataQuality: filters.dataQuality` to the `where` clause of `AirportsRepository.findAll`, so `GET /api/v1/airport?dataQuality=flagship` works and composes with `continent`. Prisma treats `undefined` as "no constraint", so an absent filter needs no branch.

## 9. Data quality functional tests

- [x] 9.1 Add `"dataQuality": "low"` to every asserted airport response body across the suite — ~170 occurrences in 30 feature files under `features/` — because the Cucumber `response body should contain` step compares exact key counts, so an unlisted new key fails every full-body airport assertion (airport, flight, aircraft, statistics and operator bodies all embed the airport shape).
- [x] 9.2 Add to `features/airport/airport.update.feature`: operations raises Frankfurt (`f35c094a-bec5-4803-be32-bd80a14b441a`) to `high` and the full response body is asserted with `"dataQuality": "high"`, ending with "I set database to initial state".
- [x] 9.3 Add to `features/airport/airport.update.feature`: an unknown grade (`perfect`) returns `400` with the violation `dataQuality must be one of the following values: low, high, flagship`.
- [x] 9.4 Add the actor matrix for the grade edit to `features/airport/airport.update.feature`: cabin crew gets `403`, an unauthenticated caller gets `401`.
- [x] 9.5 Add to `features/airport/airport.list.feature`: operations patches Frankfurt to `flagship`, then a cabin crew `GET /api/v1/airport?dataQuality=flagship` returns exactly that one airport as a full body; reset the database afterwards. Seed-only filtering was not possible because every seeded airport is `low` by design (design decision 11).
- [x] 9.6 Add to `features/airport/airport.list.feature`: filtering by a grade no airport holds returns `200` with `[]`, and an invalid filter value returns `400` with the same violation message as 9.3.
- [x] 9.7 No unauthenticated read scenario for the grade — `GET /api/v1/airport` and `GET /api/v1/airport/:id` are `@SkipAuth()`, so the grade is public to anyone who can read an airport; the existing list/get actor scenarios already cover admin, operations and cabin crew.

## 10. Verify

- [x] 10.1 `docker compose exec app npx prisma generate` regenerates the client into `prisma/client/` with the new `DataQuality` enum.
- [x] 10.2 `docker compose exec app npx prisma db push` syncs the dev database (`migrate deploy` fails with P3005 there), then reseed.
- [x] 10.3 `docker compose exec app npm run lint` passes.
- [x] 10.4 `docker compose exec app npm test -- country-name` passes — 6 tests.
- [x] 10.5 `docker compose exec app npx cucumber-js features/airport` passes, including the five new data-quality scenarios.
- [x] 10.6 `docker compose exec app npx cucumber-js features/skylink features/flight` passes with the resolved country names.
- [x] 10.7 The full functional suite passes; restart the `app` container before the run if `npm run build` was executed, since building while `start:dev` watches crashes the dev server.
