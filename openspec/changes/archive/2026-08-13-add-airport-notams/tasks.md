## 1. Schema

- [x] 1.1 Add `model AirportNotam` to `prisma/schema.prisma`, next to `AirportWeather`: `id` (`uuid`, `@db.Uuid`), `airportId` (`@db.Uuid`), `notamId` (`@db.VarChar(16)`), `dateCreated`, `dateEffective`, `dateExpire` (`DateTime?`), `dateModified`, `html`, `text`, `raw`, `nrc` (`@db.VarChar(8)`), `qcode` (`@db.VarChar(8)`), `qcodeCategory`, `qcodeSubject`, `qcodeStatus`, an `airport Airport @relation(fields: [airportId], references: [id], onDelete: Cascade)`, `@@unique([airportId, notamId])`, `@@index([airportId, dateExpire])`, `@@map("airport_notam")`.
- [x] 1.2 Add the `notams AirportNotam[]` back-relation to `model Airport`.
- [x] 1.3 Add `prisma/migrations/20260809120000_add_airport_notams/migration.sql` by hand, matching the repo's convention (the dev database is built with `db push`, so `migrate dev` would demand a destructive reset). Verified by deploying the whole migration history into a throwaway shadow database and diffing it against the datamodel: no `airport_notam` drift.

## 2. Airports module — model and repository

- [x] 2.1 Add `src/modules/airports/model/airport-notam.model.ts` with `AirportNotamData` (the column shape minus `id`/`airportId`) and `GetAirportNotamResponse` carrying `@ApiProperty` for every returned field — `notamId`, `dateCreated`, `dateEffective`, `dateExpire` (`nullable: true`), `dateModified`, `html`, `text`, `raw`, `nrc`, `qcode`, `qcodeCategory`, `qcodeSubject`, `qcodeStatus` — with realistic examples taken from a real OFP record (`A3912/26`, `QMXLC`, `Airport`, `Taxiway`, `Closed`), following `airport-weather.model.ts`.
- [x] 2.2 Add `src/modules/airports/model/airport-notams.model.ts` (or extend 2.1) with `AirportNotams = { icaoCode: string; notams: AirportNotamData[] }`, the neutral ingest DTO the flights module fills in.
- [x] 2.3 Add `AirportNotamsRepository` in `src/modules/airports/infra/database/airport-notams.repository.ts` with a `selectNotam` const `satisfies Prisma.AirportNotamSelect` and an exported `AirportNotamView`, mirroring `airport-weather.repository.ts`.
- [x] 2.4 Add `AirportNotamsRepository.findActiveByAirportId(airportId)`: `where: { airportId, OR: [{ dateExpire: null }, { dateExpire: { gte: new Date() } }] }`, `orderBy: { dateEffective: 'desc' }`, `select: selectNotam`.
- [x] 2.5 Add `AirportNotamsRepository.replaceForAirports(entries: { airportId: string; notams: AirportNotamData[] }[])`: inside one `this.prisma.$transaction([...])`, a `deleteMany({ where: { airportId: { in: allIds } } })` over **every** passed airport id followed by a single `createMany` of the flattened rows; skip the `createMany` when there are no rows.
- [x] 2.6 Add `AirportsRepository.findIdsByIcaoCodes(icaoCodes: string[]): Promise<Map<string, string>>` (or a `findManyBy`-style equivalent) returning ICAO → airport id for the codes that exist, so unknown codes are simply missing from the map.

## 3. Airports module — read path

- [x] 3.1 Add `ListAirportNotamsQuery(airportId)` + handler in `src/modules/airports/application/query/notam/list-airport-notams.query.ts`: throw `AirportNotFoundError` when `AirportsRepository.exists` is false, then return `findActiveByAirportId`, following `list-runways-by-airport.query.ts`.
- [x] 3.2 Add `ListNotamsAction` in `src/modules/airports/infra/http/action/notam/list-notams.action.ts`: `@ApiTags('airport notam')`, `@Controller('api/v1/airport/:airportId/notam')`, `@Get()`, `@SkipAuth()`, `@UuidParam('airportId')`, `@ApiOkResponse({ type: GetAirportNotamResponse, isArray: true })`, `@ApiBadRequestResponse`, `@ApiNotFoundResponse`, `@ApiParam`, and an `@ApiOperation` summary stating that only NOTAMs currently in force are returned.

## 4. Airports module — ingest path

- [x] 4.1 Add `ReplaceAirportNotamsCommand(airports: AirportNotams[])` + handler in `src/modules/airports/application/command/notam/replace-airport-notams.command.ts`: resolve ICAO codes via `findIdsByIcaoCodes`, drop codes with no airport, then call `replaceForAirports`. Return early when nothing resolves.
- [x] 4.2 In the same handler, merge duplicate ICAO codes across sections and keep the first record per `notamId` per airport, so a plan listing one airport twice cannot violate `@@unique([airportId, notamId])`.
- [x] 4.3 Register `AirportNotamsRepository`, `ListAirportNotamsHandler` and `ReplaceAirportNotamsHandler` in `providers`, and `ListNotamsAction` in `controllers`, of `airports.module.ts`.

## 5. SimBrief provider types

- [x] 5.1 Add `SimbriefNotam` to `src/core/provider/simbrief/type/simbrief.types.ts` with the nested per-airport field names: `notam_id`, `location_icao`, `location_type`, `date_created`, `date_effective`, `date_expire`, `date_modified`, `notam_html`, `notam_text`, `notam_raw`, `notam_nrc`, `notam_qcode`, `notam_qcode_category`, `notam_qcode_subject`, `notam_qcode_status`. Type the fields that can come back as an empty object as `string | Record<string, never>` (json=2 renders an empty XML element as `{}`), and mark `date_expire` optional.
- [x] 5.2 Add `notam?: SimbriefNotam[] | SimbriefNotam` to the existing OFP `Airport` type, and add the sections that carry NOTAMs but are not modelled yet: `takeoff_altn?: Airport | Airport[]`, `enroute_station?: Airport[]`, and `suitable_airport?: Airport | Airport[]` on `etops`. Keep the existing fields untouched.

## 6. Flights module — dispatch from the import

- [x] 6.1 In `CreateFlightFromSimbriefHandler`, add a private `collectAirportNotams(ofp): AirportNotams[]` that walks `origin`, `destination`, `alternate`, `takeoff_altn`, `enroute_altn`, `enroute_station`, `etops.entry`, `etops.exit` and `etops.suitable_airport`, normalising each section and each `notam` field to an array (a section that occurs once arrives as an object, several as an array), and returns one entry per section airport keyed by `notam.location_icao` (falling back to the section's `icao_code`).
- [x] 6.2 Add a private `toNotamData(record): AirportNotamData` mapping the SimBrief record to the column shape: `new Date(...)` for the four ISO-8601 dates, `dateExpire` as `null` whenever `date_expire` is absent or not a string, and every text field guarded so a `{}` becomes `''`. Skip any record whose `location_type` is not `Airport` or whose `notam_id` is missing.
- [x] 6.3 Dispatch `ReplaceAirportNotamsCommand` after the airports are imported and before the handler returns (next to the existing `AssignCrewToFlightCommand` dispatch), assigning the command to a `const` before `execute`.
- [x] 6.4 Confirm `flights.module.ts` needs no new import — the command goes over `CommandBus`, as `ImportAirportByIcaoCommand` already does.

## 7. Fixtures

- [x] 7.1 Add `prisma/seed/resource/notams.seed.ts` (also seeds one KPHL NOTAM, so the "plan mentions the airport but publishes none" clearing case is observable in a test) exporting `loadNotams(tx)` with `Prisma.AirportNotamCreateManyInput[]`: for EPWA (`616cbdd7-ccfc-4687-8cf6-1e7236435046`) two NOTAMs in force (one with a far-future `dateExpire`, one with `dateExpire: null`), one already expired, and one whose `dateEffective` is in the future but not yet expired; for EDDF (`f35c094a-bec5-4803-be32-bd80a14b441a`) one in force; leave BIKF (`523b2d2f-9b60-405a-bd5a-90eed1b58e9a`) with none. Use fixed dates far enough out that the suite does not rot, and vary `dateEffective` so the ordering assertion is meaningful.
- [x] 7.2 Call `loadNotams(tx)` from `prisma/seed/load-resources.ts` immediately after `loadWeather(tx)`.
- [x] 7.3 Add nested `notam` arrays to the OFP bodies in `docker/mock/simbrief.json`: for userid `123456` (the happy-path plan, EDDF → KJFK) give `origin` two NOTAMs and `destination` one, plus one on an `alternate` entry and one on `etops.suitable_airport` for an airport already seeded, using the real field names and ISO-8601 dates with far-future expiries. Include one record with `date_expire: {}` and one with `notam_schedule: {}` so the empty-object guards are exercised. Leave the other four expectations without NOTAMs so the "plan publishes none" path is covered.

## 8. Functional tests

- [x] 8.1 Add `features/airport/notam/airport.list-notams.feature`. Role matrix as in `airport.get-weather.feature`: admin, operations, cabin crew and unauthenticated all get `200` with the same body for EPWA.
- [x] 8.2 Same feature: the EPWA response contains the NOTAMs in force with every field asserted, omits the expired one, includes the one with `dateExpire: null`, includes the future-effective one, and is ordered by `dateEffective` descending.
- [x] 8.3 Same feature: BIKF returns `200` with `[]`; a random unused UUID returns `404` with the `GenericNotFoundResponse` body; `not-a-uuid` returns `400`.
- [x] 8.4 Extend `features/flight/management/flight.create-with-simbrief.feature`: after a successful import as "operations with valid Simbrief ID", `GET /api/v1/airport/f35c094a-bec5-4803-be32-bd80a14b441a/notam` returns the two NOTAMs the mock plan publishes for EDDF, with the fields as published, and the destination airport likewise returns its one.
- [x] 8.5 Same feature: the replacement contract — the seeded EDDF NOTAM from 7.1 is gone after the import (it is not in the plan), and importing a second time leaves the same NOTAMs with no duplicates.
- [x] 8.6 Same feature: an airport not mentioned by the plan (EPWA) still has its seeded NOTAMs after the import.
- [x] 8.7 Reset the database at the end of any scenario that imports a plan, following the existing SimBrief scenarios.

## 9. Verify

- [x] 9.1 `docker compose exec app npm run lint` and `npm run build` pass.
- [x] 9.2 `docker compose exec app npm run database:seed` succeeds with the new seed resource.
- [x] 9.3 `docker compose exec app npx cucumber-js features/airport/notam` passes.
- [x] 9.4 `docker compose exec app npx cucumber-js features/flight/management/flight.create-with-simbrief.feature` passes (13 scenarios). Full `features/airport` + `features/flight` run with fail-fast disabled: 542/543 pass. The one failure, `Checking in a pilot marks every airport of the flight as watched` (`features/airport/weather/airport.get-weather.feature:100`), fails identically on a clean tree with this change stashed — pre-existing, unrelated to NOTAMs. `npm test`: 166/166.
