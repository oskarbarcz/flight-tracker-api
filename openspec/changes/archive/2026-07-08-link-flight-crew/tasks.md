## 1. Data model

- [x] 1.1 Add `model CrewOnFlights` to `prisma/schema.prisma` — `crewId String @db.Uuid`, `flightId String @db.Uuid`, `crew Crew @relation(..., onDelete: Cascade)`, `flight Flight @relation(..., onDelete: Cascade)`, `@@id([crewId, flightId])`, `@@map("crew_flight")`
- [x] 1.2 Add back-relations: `flights CrewOnFlights[]` on `Crew`, `crew CrewOnFlights[]` on `Flight`
- [x] 1.3 `docker compose exec app npx prisma generate` + `prisma db push`

## 2. Crew-flight persistence (operators module, CrewRepository)

- [x] 2.1 `upsert(...)` returns the crew id (Prisma `upsert` returns the row)
- [x] 2.2 `linkToFlight(flightId, crewIds: string[])` → `crewOnFlights.createMany({ data, skipDuplicates: true })`
- [x] 2.3 `unlinkFromFlight(flightId, crewId)` → `deleteMany` the `crew_flight` row (no-op if absent)
- [x] 2.4 `findByFlight(flightId): Promise<Crew[]>` → crew filtered by `flights.some.flightId`, ordered by role then name (deterministic assertions)

## 3. Auto-link on import

- [x] 3.1 Update `AssignCrewToFlightHandler`: upsert each member collecting ids, then `linkToFlight(flightId, ids)` — still synchronous within the SimBrief flow

## 4. Explicit assign / remove (operators command handlers)

- [x] 4.1 `AssignCrewMemberToFlightCommand(flightId, operatorId, crewId)` + handler — verify the crew exists (`CrewNotFoundError` → 404) and belongs to `operatorId` (`CrewOperatorMismatchError` → 409), then `linkToFlight(flightId, [crewId])`. Added `model/error/crew.error.ts`
- [x] 4.2 `RemoveCrewMemberFromFlightCommand(flightId, crewId)` + handler — `unlinkFromFlight` (idempotent)
- [x] 4.3 `ListFlightCrewQuery(flightId)` + handler → `findByFlight`
- [x] 4.4 Register the two handlers + query handler in the operators module `providers`

## 5. Flight sub-resource actions (flights module, one action per file under `action/crew/`)

- [x] 5.1 `list-flight-crew.action.ts` — `@Get()` on `/api/v1/flight/:flightId/crew`, JWT, no role gate; assert flight exists via `GetFlightQuery` (→404), dispatch `ListFlightCrewQuery`, return `Crew[]`
- [x] 5.2 `assign-flight-crew.action.ts` — `@Post()`, `@Role(Operations)`, body `{ crewId }` (`AssignFlightCrewRequest`, `@IsUUID`); `GetFlightQuery` → flight (`flight.operator.id`), dispatch `AssignCrewMemberToFlightCommand`, then read-back via `ListFlightCrewQuery`
- [x] 5.3 `remove-flight-crew.action.ts` — `@Delete(':crewId')`, `@Role(Operations)`, `@HttpCode(204)`; `GetFlightQuery` (→404), dispatch `RemoveCrewMemberFromFlightCommand`
- [x] 5.4 Register the three actions in the flights module `controllers`

## 6. Seed

- [x] 6.1 Added American crew (James/Susan/Emily, fixed ids) to `crew.seed.ts` and a `loadFlightCrew` linker (crew → AAL4917) wired into `loadResources()` after `loadFlights` (the link FK needs the flight to exist)

## 7. Tests

- [x] 7.1 `features/flight/crew/flight.list-crew.feature`: GET the flight's crew → full-body assert; empty-list, unknown-flight (404), any-authenticated (cabin crew), unauthorized (401)
- [x] 7.2 `features/flight/crew/flight.assign-crew.feature`: assign → 201 + list; idempotent; different operator → 409; unknown crew → 404; unknown flight → 404; non-operations → 403; unauthorized → 401
- [x] 7.3 `features/flight/crew/flight.remove-crew.feature`: DELETE → 204, crew gone from flight list but still under operator; non-operations → 403
- [x] 7.4 Cascade scenario in `flight.delete.feature`: assign crew to a Created flight → delete it (204, no FK block) → crew still listed under the operator

## 8. Verify

- [x] 8.1 `npm run lint` (0 errors) + `npm run format:fix` (clean)
- [x] 8.2 `npm run build` passes
- [x] 8.3 New/affected features pass (36/36); full `cucumber-js` pass green (774/774)
