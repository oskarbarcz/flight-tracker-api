## Context

The `change-requests` module already types proposals per kind: `ChangeRequestValues` maps each
`ChangeRequestResource` to its field types, `ChangeRequestTargets` holds a `ChangeRequestTargetMap`
so a kind without an adapter fails to compile, and one submit action per kind feeds the generic
`SubmitChangeRequestCommand`. Airports are the only kind.

A parking stand differs from an airport in one way that matters: it is nested. Every existing
stand read and write in `airports` is scoped by airport (`GetParkingPositionByIdQuery(airportId,
id)`, `UpdateParkingPositionCommand(airportId, id, data)`), while a proposal stores only its
`targetId`.

## Goals / Non-Goals

**Goals:**

- Parking stands as a second kind, with no change to the queue, its actions or its table shape.
- Reuse the existing stand edit command so a proposal and a direct edit write the same way.

**Non-Goals:**

- Proposing new stands, removing stands, or moving a stand to another airport.
- Showing the stand's airport in the queue list (reviewers open the proposal or the stand).
- Fixing the accept race or the class-instance equality noted in review of the airport change.

## Decisions

**1. Resource name `parkingPosition`.** It matches the Prisma model, the stand endpoints and the
OSM enrich vocabulary (`ProposedResource`). Adding it is an `ALTER TYPE … ADD VALUE` migration.

**2. One new query to break the nesting: `FindParkingPositionQuery(parkingPositionId)`** in
`airports`, answering the stand (including its `airportId`) or `ParkingPositionNotFoundError`. The
adapter uses it to learn the airport, then calls the existing airport-scoped command. The
alternative, storing the airport beside the target, would put a stand-specific column on a
generic table.

**3. Terminal ownership: `AssertTerminalBelongsToAirportQuery(airportId, terminalId)`** in
`airports`, throwing the existing `TerminalNotFoundError` (404) — the same answer a direct edit
gives through `UpdateParkingPositionCommand`.

**4. Submission is scoped by the URL.** `POST api/v1/airport/:airportId/parking-position/
:parkingPositionId/request-data-change`, tagged `airport parking position` like the other stand
endpoints, cabin crew only. The action first dispatches `AssertParkingPositionExistsQuery(airportId,
id)` (new, in `airports`: `AirportNotFoundError` or `ParkingPositionNotFoundError`, both 404), then
`SubmitChangeRequestCommand(parkingPosition, id, body, user)`. The adapter's `validate` checks the
terminal against the stand's own airport.

**5. Typed values `ParkingPositionValues`** in `model/parking-position-change.model.ts`, every
editable field with its enum type and `null` where the column is nullable. The request DTO is
`PartialType(PickType(ParkingPosition, [...fields]))`, which reuses every validator and leaves
`airportId` out, so the whitelist rejects it.

**6. Apply.** `UpdateParkingPositionCommand(airportId, id, changes)`; `ParkingPositionValues` is
assignable to `UpdateParkingPositionRequest`, so no cast.

## Risks / Trade-offs

- **Queue entries show only the stand id** → a reviewer cannot tell the airport from the list.
  Accepted for now; the single read and the stand endpoint answer it.
- **Seed growth changes existing feature bodies** → the queue and own-list features gain the stand
  proposals; they are updated in the same change.

## Migration Plan

`ALTER TYPE "change_request_resource" ADD VALUE 'parkingPosition';` — additive. Rolling back
requires deleting stand proposals first, since Postgres cannot drop an enum value in place.
