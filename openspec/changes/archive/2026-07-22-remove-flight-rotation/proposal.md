## Why

Flight rotation (grouping flights under a named rotation, tracking a pilot's "current rotation") is going to be reimplemented from scratch in a fundamentally different way. The existing implementation is spread across the `operators`, `flights`, and `users` modules and threads a `rotationId` through every flight lifecycle event, adding weight to code we no longer want to keep. Removing it now clears the ground for the new design and stops us maintaining a feature that is about to be discarded.

## What Changes

- **BREAKING** Remove the operator rotation CRUD endpoints: `POST/GET/PATCH/DELETE /api/v1/operator/:operatorId/rotation[/:rotationId]`.
- **BREAKING** Remove the flight↔rotation assignment endpoints: `POST/DELETE /api/v1/flight/:flightId/rotation/:rotationId`.
- **BREAKING** Remove `rotation` and `rotationId` from the flight API payloads, `currentRotationId` from the user payload, and `rotationId` from flight event payloads.
- **BREAKING** Drop the domain events `flight.added-to-rotation` and `flight.removed-from-rotation`.
- Stop maintaining `User.currentRotation` on pilot check-in / flight close (the users module lifecycle listener no longer reacts to rotation).
- Remove the `Rotation` Prisma model and every relation to it (`Flight.rotationId`, `User.currentRotationId` + its unique index, `User.rotations`, `Operator.rotations`), via a new migration that drops the table, columns, and constraints.
- Delete all rotation source files (models, errors, requests, repository methods, commands, queries, actions, assert handler) and their DI registrations in `operators.module.ts` and `flights.module.ts`.
- Remove rotation seed data and update user/flight seed fixtures to drop the dropped fields.
- Delete the dedicated rotation Cucumber features and strip rotation assertions from the remaining flight/user feature files and unit test fixtures.
- Remove stale rotation mentions from `CLAUDE.md`, `README.md`, and the Swagger API description.

## Capabilities

### New Capabilities
<!-- None: this change only removes behavior. -->

### Modified Capabilities
<!-- None at the spec level: rotation was never captured in an openspec/specs/ capability, so no documented requirement changes. The removed behavior touches spec'd capabilities (flight-crew, operator-crew) only through side effects those specs never described. -->

## Impact

- **API (breaking):** removes the operator-rotation and flight-rotation endpoints; removes `rotation`/`rotationId`/`currentRotationId` fields from flight, user, and flight-event responses.
- **Database (breaking):** drops the `rotation` table plus the `flight.rotationId` and `user.currentRotationId` columns and their foreign keys / unique index. Existing rotation data is discarded (acceptable — the feature is being retired).
- **Domain events:** removes two `FlightEvent` enum members and their event classes; strips `rotationId` from the shared flight event payload consumed across the `flights` and `users` modules.
- **Modules touched:** `operators`, `flights`, `users`, plus `core/domain/events` and the Swagger config.
- **Tests:** deletes 7 rotation feature files and edits ~25 remaining feature files and 6 unit-test spec fixtures that assert rotation fields.
