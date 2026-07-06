## Context

Flight participation as pilot is already captured on `Flight.captainId`, set by
`CheckInPilotCommand` (`checkInCaptain(flightId, initiatorId)`), which then emits
`PilotCheckedInEvent { flightId, actorId: initiatorId, aircraftId, rotationId }`. The
check-in actor therefore _is_ the captain. Aggregate pilot stats already roll up onto
the `User` row on-block; cabin-crew movement is tracked separately in `UserTravel`.
There is currently no way to list the individual aircraft a user has flown.

The users module already owns the analogous `UserTravel` stack (model, repository,
`ListUserTravel` query, `/user/:id/travel` action) and a `FlightLifecycleListener`
subscribed to flight events, plus a self-scoped `/me/stats` endpoint. This change mirrors
those patterns.

## Goals / Non-Goals

**Goals:**

- Persist "user captained aircraft X on flight Y" at check-in time.
- Expose `GET /me/aircraft` for the authenticated user, one entry per captained flight,
  newest first, including in-progress flights.
- Backfill the new table from all existing captained flights.
- Keep the table minimal (foreign keys only); resolve display data at read time.

**Non-Goals:**

- No de-duplication into a distinct-aircraft set — one row per captained flight is intended.
- No cabin-crew / dead-head history here (that remains `UserTravel`).
- No `:id`-scoped variant for viewing another user's history.
- No change to the check-in command, the event payload, or existing endpoints.

## Decisions

- **Source of truth: a dedicated `user_aircraft` association, written on `PilotCheckedIn`.**
  Rather than deriving the read from `Flight.captainId` each time, we materialize the
  association at check-in. This decouples the history from future changes to how
  `captainId` is computed and keeps the read a simple, indexed lookup. The write is
  equivalent to "captained flights only" because the event actor is the captain.

- **Thin table, FKs only.** Columns: `id`, `userId`, `aircraftId`, `flightId`,
  `createdAt`. No denormalized display values. `operatorId` is intentionally omitted —
  the operator is derivable from the flight (`flight.operatorId`), and the _flight's_
  operator is the correct per-trip value (an aircraft's own `operatorId` is static).
  `@@index([userId])` supports the read.

  ```prisma
  model UserAircraft {
    id         String   @id @default(uuid()) @db.Uuid
    userId     String   @db.Uuid
    aircraftId String   @db.Uuid
    flightId   String   @db.Uuid
    createdAt  DateTime @default(now())
  
    user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)
    aircraft Aircraft @relation(fields: [aircraftId], references: [id])
    flight   Flight   @relation(fields: [flightId], references: [id])
  
    @@index([userId])
    @@map("user_aircraft")
  }
  ```

- **Dedicated `UserAircraftListener` (users module) on `PilotCheckedIn`.** Kept separate
  from the existing `FlightLifecycleListener` for single responsibility. It inserts one
  row directly from the event payload (`userId: actorId`, `aircraftId`, `flightId`) — no
  extra fetch, since operator is no longer stored.

- **Read via QueryBus + repository (convention-preserving).** `GetMyAircraftAction`
  (`GET /me/aircraft`) reads `request.user.sub`, dispatches `ListUserAircraftQuery`, whose
  handler calls `UserAircraftRepository.findByUser`. The repository reads `user_aircraft`
  directly (no flight-derivation), `orderBy createdAt desc`, selecting the aircraft
  (`id, registration, type, livery`) and the flight's operator; the airframe is resolved
  from `type` via `findAirframeByType` (in-memory, no DB), matching how the operators
  module builds its `Aircraft` model.

- **Response shape** (per entry): `{ id: aircraftId, registration, airframe: Airframe,
livery, operator, flightId }`. A new `UserAircraftEntry` response DTO with Swagger
  metadata, mirroring existing user DTOs.

- **Backfill in the migration.** After `CREATE TABLE`, run:

  ```sql
  INSERT INTO user_aircraft (id, user_id, aircraft_id, flight_id, created_at)
  SELECT gen_random_uuid(), f.captain_id, f.aircraft_id, f.id, now()
  FROM flight f
  WHERE f.captain_id IS NOT NULL;
  ```

  Postgres 16 provides `gen_random_uuid()` natively.

- **Testing: seed-based.** Seed `user_aircraft` fixtures with fixed v4 UUIDs consistent
  with existing captained flights, then assert the full `GET /me/aircraft` body — no
  driving the check-in flow to manufacture state.

## Risks / Trade-offs

- **Duplicates on re-check-in.** Re-check-in is not possible by design (check-in requires
  status `Ready` and immediately moves it to `CheckedIn`), so no unique constraint is
  added. If that invariant ever changes, a `@@unique([userId, flightId])` (with upsert)
  would be the guard.
- **Write/derived drift.** The materialized table can diverge from `Flight.captainId` if
  captain assignment ever changes after check-in. Accepted: history is defined as
  "aircraft flown at check-in time." The backfill re-derives from `captainId` for
  existing data.
- **Redundant storage vs. querying flights.** The table overlaps with what a
  `Flight where captainId = me` query could produce; the explicit table is chosen for a
  stable, decoupled read surface and cheap indexed lookups.
- **Airframe resolution coupling.** Read depends on `findAirframeByType`; an aircraft
  `type` absent from the airframe catalog would fail resolution — same behavior as the
  existing operators aircraft mapping, so no new risk class.
