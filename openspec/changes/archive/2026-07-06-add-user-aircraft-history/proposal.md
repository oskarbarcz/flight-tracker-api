## Why

Users want to see every aircraft they have flown (captained) up to today. The data
already exists implicitly (`Flight.captainId` → `Flight.aircraftId`), but there is no
endpoint to read it and no persisted record decoupled from flight lifecycle state.
A dedicated `user_aircraft` association, written at pilot check-in, gives a stable,
cheap-to-read history that does not depend on how `captainId` is derived over time.

## What Changes

- Add a `user_aircraft` table: a thin association `(userId, aircraftId, flightId, createdAt)`
  recording that a user captained a given aircraft on a given flight.
- Populate it from the `PilotCheckedIn` domain event via a new dedicated
  `UserAircraftListener` in the users module (the check-in actor is the captain, so this
  is exactly "captained flights only").
- Add `GET /api/v1/user/me/aircraft` — returns the authenticated user's flown-aircraft
  history (one entry per captained flight, newest first), reading the association and
  joining aircraft + the flight's operator; the airframe is resolved from the aircraft
  type in-memory.
- Add a data-backfill migration that creates a `user_aircraft` row for every existing
  flight that has a captain (`captain_id IS NOT NULL`), across all statuses.

## Capabilities

### New Capabilities

- `user-aircraft`: recording and exposing the history of aircraft a user has captained,
  populated at pilot check-in and readable via `GET /me/aircraft`.

### Modified Capabilities

<!-- None. No existing spec-level behavior changes; check-in keeps its current contract
     and merely gains a new event subscriber. -->

## Impact

- **Schema/DB:** new `UserAircraft` model in `prisma/schema.prisma`; back-relations on
  `User`, `Aircraft`, `Flight`; a create-table migration plus an `INSERT … SELECT`
  backfill.
- **API:** new endpoint `GET /api/v1/user/me/aircraft` (JWT-protected, self-scoped).
- **Events:** new subscriber on the existing `flight.pilot-checked-in` event; no change
  to the event payload or to `CheckInPilotCommand`.
- **Module wiring:** new listener, repository, query handler, controller, and response
  DTO registered in `UsersModule`.
- **Seed/tests:** seed `user_aircraft` fixtures with fixed UUIDs; new Cucumber scenario
  under `features/user/`.
