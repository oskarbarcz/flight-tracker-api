## Why

The `operator-crew` capability gives each operator a pool of named crew, but nothing records **which flight** a given crew member staffs. The `AssignCrewToFlightCommand` already receives the `flightId` (carried forward for exactly this step) yet discards it. We want to know which crew members are on which flight — established two ways: automatically from the imported SimBrief roster, and explicitly by operations building the manifest from the operator's crew pool.

## What Changes

- Add a `CrewOnFlights` join table linking a flight to the crew members on it (mirrors the existing `AirportsOnFlights` explicit join). All imported roles are linked — first officer, purser, and flight attendants.
- **Auto-link on import:** extend the existing synchronous `AssignCrewToFlightCommand` so that, after upserting each crew member, it records a flight↔crew assignment.
- **Explicit assignment:** operations can add a crew member to a flight and remove one, independent of the SimBrief import — `POST /api/v1/flight/{flightId}/crew` (body `{ crewId }`) and `DELETE /api/v1/flight/{flightId}/crew/{crewId}`. Only crew belonging to the flight's operator may be assigned.
- Both paths are idempotent: a crew member is linked to a flight at most once.
- Expose `GET /api/v1/flight/{flightId}/crew` returning the crew on that flight (a flight sub-resource read, alongside `/events`, `/ofp`, `/delay`).
- Cascade-delete assignments when either the flight or the crew member is deleted.

Out of scope: embedding the crew array inside the main `GET /flight/:id` response (kept a separate read to avoid churning every full-body flight assertion); populating `Flight.captainId` from the live player.

## Capabilities

### New Capabilities

- `flight-crew`: the relationship between a flight and the crew on it — the link created automatically on import and explicitly by operations, its idempotency and operator-consistency rules, the flight-scoped read, and cascade cleanup.

### Modified Capabilities

<!-- None. operator-crew's import requirement is unchanged; flight↔crew linking is additive behavior owned by the new flight-crew capability. -->

## Impact

- **New Prisma model** `CrewOnFlights` (`crewId`, `flightId`, `@@id([crewId, flightId])`, `@@map("crew_flight")`) with `onDelete: Cascade` on both relations, plus back-relations `Crew.flights` and `Flight.crew`. Requires `prisma db push`.
- **operators module** (`crew` subdomain, single owner of the crew tables):
  - `CrewRepository.upsert` returns the crew id; new `linkToFlight`, `unlinkFromFlight`, `isLinked`, `findByFlight`.
  - `AssignCrewToFlightHandler` links after upserting (auto path).
  - New `AssignCrewMemberToFlightCommand(flightId, operatorId, crewId)` + `RemoveCrewMemberFromFlightCommand(flightId, crewId)` handlers (explicit path; assign validates the crew belongs to the operator).
  - New `ListFlightCrewQuery(flightId)` + handler.
- **flights module**: new one-action-per-file HTTP actions under `action/crew/` mounted at `/api/v1/flight/:flightId/crew` — list (GET, any authenticated), assign (POST, Operations), remove (DELETE, Operations) — each asserting the flight exists then dispatching the operators command/query via the bus.
- **New endpoints**: `GET`/`POST /api/v1/flight/{flightId}/crew`, `DELETE /api/v1/flight/{flightId}/crew/{crewId}`.
- **Seed**: link seeded crew to a seeded flight of the same operator via `crew_flight` (fixed ids) for the read test.
- **Tests**: flight-scoped read, explicit assign (+ operator-mismatch rejection, idempotency), explicit remove, and cascade-on-flight-delete.
