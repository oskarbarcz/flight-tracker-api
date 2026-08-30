<!--
The groups are ordered by dependency and all land in one release: groups 5-7 leave the code
reading a table that group 1 creates, so nothing here is deployable on its own. Split them into
issues if that helps to review them, but merge them together. `data.sql` is run by hand after
the release, and until it is, existing flights report no loadsheets while their figures sit
untouched in the old column. Group 10 is the gate on running it, not a follow-up. Group 11 is
the Definition of Done applied inside every group.
-->

## 1. Schema and migration

- [x] 1.1 `schema.prisma`: `LoadsheetKind` Prisma enum (`preliminary`, `final`)
- [x] 1.2 `schema.prisma`: `FlightLoadsheet` — `flightId`, `kind`, `revision`, the crew counts, `passengers`, `passengerMass` as `Decimal(4,1)`, the four tonnages as `Decimal(7,3)`, `issuedById`, `issuedAt`, mapped to `flight_loadsheet`
- [x] 1.3 `schema.prisma`: the eighteen `fuel*` columns on `FlightLoadsheet`, all nullable, `fuelContingencyType` a `VarChar(64)` and the rest `Decimal(7,3)`
- [x] 1.4 `schema.prisma`: `@@unique([flightId, kind, revision])` and `@@index([flightId])`; the unique is what enforces one final loadsheet per flight, since a final is always written with revision 1
- [x] 1.5 `schema.prisma`: the per-cabin passenger counts as four nullable columns — `firstPassengers`, `businessPassengers`, `premiumEconomyPassengers`, `economyPassengers` — since `CabinClass` is a closed set of four
- [x] 1.6 `schema.prisma`: the table cascade-deleted with the flight; `issuedBy` is `SetNull` on user deletion, matching `FlightNotoc.acknowledgedBy`
- [x] 1.7 `schema.prisma`: remove `Flight.loadsheets` and add the loadsheet relation
- [x] 1.8 Migration `20260830120000_extract_flight_loadsheets`: create the enum, the table, its indexes and foreign keys — and nothing else; `flight.loadsheets` and its rows stay
- [x] 1.9 `prisma/data/20260830120000_extract_flight_loadsheets/data.sql`: the three `loadsheet_import_*` helper functions — type-checking reads, whole-loadsheet completeness, all-or-nothing fuel
- [x] 1.10 `data.sql`: copy preliminary loadsheets as revision 1, issuer and time from the latest `flight.preliminary-loadsheet-updated` event, falling back to the flight's creator and creation time
- [x] 1.11 `data.sql`: copy final loadsheets as revision 1, issuer and time from the `flight.boarding-finished` event, with a null issuer where there is none
- [x] 1.12 `data.sql`: copy the per-cabin counts from `passengersByCabin`, whole or not at all, through a helper that yields NULL for anything that is not a map of numbers
- [x] 1.13 `data.sql`: wrapped in a transaction, guarded so a second run inserts nothing, dropping its helper functions at the end and leaving `flight.loadsheets` untouched
- [x] 1.14 `prisma/data/20260830120000_extract_flight_loadsheets/test.sql`: sections A-D report what is stored, what is recognised, and every loadsheet left behind with the figures that disqualified it
- [x] 1.15 `test.sql` section E: reconcile every copied figure against the JSON it came from, rounded to each column's scale, returning no rows when the copy is intact

## 2. Domain model

- [x] 2.1 `LoadsheetKind` domain enum (`Preliminary`, `Final`), PascalCase keys over the values `preliminary` and `final`, separate from the Prisma enum and cast at the boundary
- [x] 2.2 `loadsheet.model.ts`: keep `Loadsheet` as the write model unchanged — every figure, every validator and every Swagger description stays as it is
- [x] 2.3 `loadsheet.model.ts`: `FlightLoadsheet` read model — a `Loadsheet` plus `id`, `kind`, `revision`, `issuedById` and `issuedAt`
- [x] 2.4 `loadsheet.model.ts`: delete the `Loadsheets` wrapper class and every import of it
- [x] 2.5 `loadsheet.policy.ts` is untouched — it validates a loadsheet's figures against each other and has no opinion on storage
- [x] 2.6 `flight.error.ts`: `LoadsheetMissingError` (422, a flight operation needs a loadsheet the flight does not have) and `LoadsheetRevisionConflictError` (409, two concurrent writes claimed the same revision)

## 3. Repository and mapping

- [x] 3.1 `flight-loadsheets.repository.ts`: `listBy(flightId, kind?)` returning loadsheets in issue order — kind ascending so preliminaries precede the final, then revision ascending
- [x] 3.2 `flight-loadsheets.repository.ts`: `findCurrent(flightId, kind)` returning the highest revision of that kind or null
- [x] 3.3 `flight-loadsheets.repository.ts`: `issuePreliminary(flightId, loadsheet, issuedById)` writing the next revision after the flight's current one
- [x] 3.4 `flight-loadsheets.repository.ts`: `issueFinal(flightId, loadsheet, issuedById)` writing revision 1
- [x] 3.5 Both writers catch the unique-constraint violation and raise `LoadsheetRevisionConflictError` rather than letting it surface as a 500
- [x] 3.6 `loadsheet.mapper.ts`: row to `FlightLoadsheet` — `Decimal` figures to numbers with `.toNumber()`, the `fuel*` columns to a `FuelBreakdown` when `fuelBlock` is not null and to null otherwise, the cabin columns to a `passengersByCabin` record when any is set and to null otherwise
- [x] 3.7 Unit spec for the mapper: a loadsheet with no fuel columns maps to no breakdown; one with `fuelBlock` set and every extended figure null maps to a breakdown carrying only the required figures; no cabin column set maps to no breakdown rather than to an empty object, and a cabin set to zero is reported as zero

## 4. Reading loadsheets

- [x] 4.1 `ListFlightLoadsheetsQuery(flightId, kind?)` returning the flight's loadsheets in issue order
- [x] 4.2 `GetCurrentLoadsheetQuery(flightId, kind)` returning the highest revision of that kind or null, for the internal consumers in group 6
- [x] 4.3 `loadsheet.dto.ts`: the `type` query filter validated against `LoadsheetKind`, so an unknown value is refused as malformed
- [x] 4.4 `loadsheet.dto.ts`: the response entry — the loadsheet figures plus kind, revision, issuer and issue time, with Swagger descriptions matching the depth of the existing flight DTOs
- [x] 4.5 `list-flight-loadsheets.action.ts`: `GET /api/v1/flight/:id/loadsheet`, `@SkipAuth()` with the same tracking gate as `GET /flight/:id` — a disabled-tracking flight is not found to an anonymous caller
- [x] 4.6 The action is not cached; the per-flight cache key ignores the query string and would serve `type=preliminary` and `type=final` from one entry
- [x] 4.7 Register the action and the queries in `flights.module.ts`

## 5. Writing loadsheets

- [x] 5.1 `update-preliminary-loadsheet.command.ts`: read the flight's current preliminary loadsheet through `GetCurrentLoadsheetQuery`, carry its planned passenger mass forward, and issue the next revision
- [x] 5.2 `update-preliminary-loadsheet.command.ts`: validation order is unchanged — fuel consistency, passenger breakdown, payload, then seat and cabin capacity — and a rejection writes no revision
- [x] 5.3 `finish-boarding.command.ts`: the final loadsheet is issued as a row, still carrying the planned passenger mass forward from the current preliminary revision
- [x] 5.4 `mark-as-ready.command.ts`: the release check asks whether the flight has a preliminary loadsheet instead of reading `flight.loadsheets.preliminary`
- [x] 5.5 `flight.dto.ts`: `CreateFlightRequest.loadsheets` becomes an optional flat `loadsheet`, and `PreliminaryLoadsheetOnly` is deleted
- [x] 5.6 `flights.repository.ts`: `create` no longer writes a `loadsheets` column; `create-flight.command.ts` issues revision 1 when a loadsheet was supplied, and emits `PreliminaryLoadsheetWasUpdated` only then, as it does today
- [x] 5.7 `create-flight-from-simbrief.command.ts`: build the flat `loadsheet` from the plan, planned passenger mass included
- [x] 5.8 `flights.repository.ts`: delete `updateLoadsheets` and the `loadsheets` field from `flightWithAircraftAndAirportsFields`
- [x] 5.9 Unit spec: a second preliminary update writes revision 2 and leaves revision 1 as it was issued
- [x] 5.10 Unit spec: a preliminary revision inherits the planned passenger mass of the revision before it, and records none where there was none

## 6. Consumers

- [x] 6.1 `declare-emergency.command.ts`: souls on board from the final loadsheet, else the current preliminary, else `LoadsheetMissingError` — the non-null assertion goes
- [x] 6.2 `generate-manifests.listener.ts`: passengers, cabin breakdown, cargo and payload from the current preliminary loadsheet
- [x] 6.3 `send-preliminary-loadsheet.listener.ts` and `send-final-loadsheet.listener.ts`: the Discord message reads its loadsheet through the query, and the message format is unchanged
- [x] 6.4 `passengers-boarding-notification.listener.ts`: the passenger count from the current preliminary loadsheet
- [x] 6.5 Unit spec: an emergency on a flight with no loadsheet is refused with the missing-loadsheet error and records nothing

## 7. The flight read loses its loadsheets

- [x] 7.1 `flight.model.ts`: remove the `loadsheets` property from `Flight`
- [x] 7.2 `get-flight.query.ts` and `list-all-flights.query.ts`: drop the `loadsheets` mapping and the `Loadsheets` import
- [x] 7.3 `flight.dto.ts`: `GetFlightResponse` and the list response carry no loadsheets
- [x] 7.4 Confirm nothing else in `src/` refers to `flight.loadsheets` or to the `Loadsheets` type

## 8. Seeds

- [x] 8.1 `flights.seed.ts`: the 28 seeded loadsheet objects become `flight_loadsheet` rows with their figures preserved exactly, so that manifest, NOTOC and cargo feature assertions keep passing
- [x] 8.2 `cargo-flights.seed.ts`, `manifest-flights.seed.ts` and `flight-manifests.seed.ts`: the same, one loadsheet each
- [x] 8.3 Seeded per-cabin breakdowns become cabin-load rows
- [x] 8.4 One seeded flight carries two preliminary revisions, so the history is reachable in a fresh environment and in the feature suite
- [x] 8.5 Seeded flights that carry no loadsheet at all stand for flights whose stored loadsheet did not migrate
- [x] 8.6 A flight seeded with a `{ preliminary: null, final: null }` loadsheet keeps having none

## 9. Features

- [x] 9.1 `flight.get-loadsheets.feature`: the full history of a flight with two preliminary revisions and a final loadsheet, in issue order, asserting the figures
- [x] 9.2 The same read filtered by `type=preliminary` and by `type=final`, the second returning an array of one
- [x] 9.3 An unknown `type` is 400, an unknown flight is 404, and a disabled-tracking flight is 404 to an anonymous caller and readable to an authenticated one
- [x] 9.4 A flight with no loadsheets returns an empty array with a 200
- [x] 9.5 `flight.update-preliminary-loadsheet.feature`: a second update appends revision 2 and revision 1 still reports what it was issued with
- [x] 9.6 `flight.mark-as-ready.feature`: the missing-loadsheet refusal reads against a flight with no loadsheet rows
- [x] 9.7 `flight.create.feature` and `flight.create-with-simbrief.feature`: creation takes the flat `loadsheet`, and the created flight's loadsheet read reports revision 1
- [x] 9.8 `flight.get.feature` and the other management features: assertions on `loadsheets` in a flight response move to the loadsheet read or are dropped where they were incidental
- [x] 9.9 `flight.declare-emergency.feature`: souls on board still comes out right; the refusal for a flight with no loadsheet is covered by the unit spec rather than a feature, since reaching an airborne status with no loadsheet needs a fixture the domain cannot otherwise produce

## 10. Verify the data scripts

- [x] 10.1 Build a scratch database at the pre-migration schema and load flights covering every stored shape: a modern loadsheet with a final one, a pre-`fuel` loadsheet, one with no loadsheet, one missing a required figure, one carrying a numeric string, one with a partial fuel breakdown, and breakdowns that are a scalar, empty, and mixed-typed
- [x] 10.2 Apply `migration.sql` and confirm it creates the tables and leaves `flight.loadsheets` in place
- [x] 10.3 Run `test.sql` before `data.sql` and confirm sections A-D name exactly the loadsheets that will be left behind and the figures that disqualify each
- [x] 10.4 Run `data.sql` and confirm the recognised loadsheets arrive, with the issuer taken from the latest loadsheet event, the partial fuel breakdown dropped whole, and the mixed-typed cabin breakdown dropped whole
- [x] 10.5 Run `test.sql` section E and confirm it returns no rows
- [x] 10.6 Run `data.sql` a second time and confirm it inserts nothing and leaves `flight.loadsheets` intact
- [ ] 10.7 Repeat 10.2 to 10.6 against a copy of production before running the scripts for real

## 11. Definition of done (applied inside every group)

- [x] 11.1 No explanatory or documentation comments in the code
- [x] 11.2 Domain enums are PascalCase and separate from Prisma enums, cast at the boundary
- [x] 11.3 Every cucumber scenario asserts a response body, never a status code alone
- [x] 11.4 `npm run lint`, `npm run typecheck`, `npm test` and `npm run test:functional` pass
- [x] 11.5 `openspec validate extract-flight-loadsheets --strict` passes
