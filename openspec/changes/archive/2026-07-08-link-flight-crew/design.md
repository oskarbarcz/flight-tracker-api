## Context

`operator-crew` imports a SimBrief roster into a per-operator `crew` pool and exposes `GET /api/v1/operator/:operatorId/crew`. The importer is `AssignCrewToFlightHandler` in the operators module; it already takes `flightId` but only upserts crew and ignores the flight. Crew belong to the operators module; flights live in the flights module.

The codebase models many-to-many with **explicit** join models (`AirportsOnFlights`: composite `@@id`, relations to both sides, `@@map`). Flight sub-resources are one-action-per-file under `flights/infra/http/action/<name>/`, mounted at `/api/v1/flight/:flightId/...` (`events`, `ofp`, `delay`, `emergency`, `diversion`, `path`). Management actions are `@Role(UserRole.Operations)`-gated; reads are typically open to any authenticated user. Cross-module command/query dispatch already flows through the global bus (the SimBrief handler in flights dispatches operators handlers).

## Goals / Non-Goals

**Goals:**

- Record which crew members (fo + pu + fa) are on which flight.
- Establish the link two ways: automatically on SimBrief import, and explicitly via an operations assign/remove action.
- Idempotent links; operator-consistent assignments; self-cleaning on flight delete.
- Expose a flight's crew as a sub-resource read.

**Non-Goals:**

- Embedding a `crew` array in the main `GET /flight/:id` body (see Decisions).
- Populating `Flight.captainId` from the live player.
- Cabin-crew-only scoping — all imported roles link (the first officer is included).

## Decisions

**Explicit `CrewOnFlights` join, mirroring `AirportsOnFlights`.** `crewId` + `flightId`, `@@id([crewId, flightId])`, `@@map("crew_flight")`, relations to `Crew` and `Flight` both `onDelete: Cascade`, plus back-relations `Crew.flights` and `Flight.crew`. _Alternative:_ Prisma implicit m2m — rejected; the codebase standardizes on explicit, `@@map`-named joins.

**Operators owns all crew persistence; flights hosts the routes.** `CrewRepository` (operators) owns `crew` and `crew_flight`: `upsert` (returns id), `linkToFlight(flightId, crewIds)` (`createMany`, `skipDuplicates`), `unlinkFromFlight(flightId, crewId)`, `isLinked`, `findByFlight`. The `/api/v1/flight/:flightId/crew` actions live in the flights module (one action per file under `action/crew/`) and dispatch operators commands/queries via the bus, after asserting the flight exists (flights `GetFlightQuery` → 404). _Alternative:_ move `crew_flight` ownership into flights — rejected to keep a single owner of the crew tables and let the import auto-link stay local in operators.

**Two write paths, both idempotent.**

- _Auto (import):_ `AssignCrewToFlightHandler` upserts each member (collecting ids) then `linkToFlight(flightId, ids)`. Unchanged trigger — still synchronous in the SimBrief flow.
- _Explicit:_ `AssignCrewMemberToFlightCommand(flightId, operatorId, crewId)` verifies the crew exists and belongs to `operatorId`, then links (idempotent via the composite PK / `skipDuplicates`). `RemoveCrewMemberFromFlightCommand(flightId, crewId)` deletes the link (no-op if absent). Named distinctly from the bulk `AssignCrewToFlightCommand` to avoid confusion.

**Operator-consistency on explicit assign.** The POST action reads the flight (which carries `operatorId`) and passes it to the command; the handler rejects a `crewId` that belongs to a different operator (crew are operator-scoped, so an American crew member has no business on a Lufthansa flight). Unknown flight/crew → 404; wrong operator → rejected (400/404).

**Auth.** Read (`GET`) is any authenticated user, matching `/operator/:id/crew` and sibling flight reads. Assign (`POST`) and remove (`DELETE`) are `@Role(UserRole.Operations)`, matching other flight-management actions.

**Dedicated sub-resource read, not embedded in the flight body.** `GET /flight/:id/crew` returns `Crew[]`. _Alternative:_ add `crew` to `GET /flight/:id` — rejected for this iteration; it would force updating every full-body flight assertion across ~20 feature files (the fuel-seed churn) for little gain. Easy additive follow-up later.

## Risks / Trade-offs

- **Two modules touch `crew_flight`** (operators persists + queries; flights exposes routes) → mitigated by keeping all persistence in the operators `CrewRepository`; flights only hosts thin actions that delegate via the bus.
- **`upsert` must return the crew id** to build the auto-link → Prisma `upsert` returns the row; the handler maps to ids.
- **Assign validation spans modules** (flight's operator vs crew's operator) → resolved by the flights action passing the flight's `operatorId` into the operators command.
- **Seeding the read test** → link seeded crew to a seeded flight of the _same_ operator; the current `crew.seed.ts` crew are LOT with no seeded LOT flight, so seed crew for the operator of a chosen seeded flight and link them.

## Migration Plan

1. Add `CrewOnFlights` + back-relations to `schema.prisma`; `prisma db push`.
2. Seed a `crew_flight` link (seeded flight + that operator's seeded crew, fixed ids) for the read test.
3. Additive; no rollback concern (new table, new endpoints).

## Open Questions

- None blocking. A combined flight view (embedding `crew` in `GET /flight/:id`) remains an additive follow-up if wanted.
