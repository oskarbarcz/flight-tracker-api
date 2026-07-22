## 1. Database & Prisma schema

- [x] 1.1 Remove the `Rotation` model from `prisma/schema.prisma`.
- [x] 1.2 Remove `Flight.rotationId` field and the `rotation` relation from the `Flight` model.
- [x] 1.3 Remove `User.currentRotationId` (+ `@unique`), the `currentRotation` relation, and the `rotations` back-relation from the `User` model.
- [x] 1.4 Remove the `rotations` back-relation from the `Operator` model.
- [x] 1.5 Add a new Prisma migration that drops FKs (`flight_rotationId_fkey`, `rotation_pilotId_fkey`, `rotation_operatorId_fkey`, `user_currentRotationId_fkey`), the unique index `user_currentRotationId_key`, the columns `flight.rotationId` and `user.currentRotationId`, and the `rotation` table.
- [x] 1.6 Run `docker compose exec app npx prisma generate` and `docker compose exec app npx prisma db push` so the dev DB and generated client (`prisma/client/`) drop all `Rotation` types.

## 2. Delete operators-module rotation code

- [x] 2.1 Delete `src/modules/operators/model/rotation.model.ts` and `src/modules/operators/model/error/rotation.error.ts`.
- [x] 2.2 Delete `src/modules/operators/infra/http/request/rotation.request.ts`.
- [x] 2.3 Delete `src/modules/operators/infra/database/repository/rotations.repository.ts`.
- [x] 2.4 Delete the 5 command/query handlers under `application/command/rotation/` and `application/query/rotation/`, plus `application/assert/assert-rotation-exists.query.ts`.
- [x] 2.5 Delete the 5 actions under `infra/http/action/rotation/`.
- [x] 2.6 Remove all rotation imports, `controllers` entries, and `providers` entries from `src/modules/operators/operators.module.ts`.

## 3. Delete flights-module rotation code

- [x] 3.1 Delete `application/command/rotation/add-flight-to-rotation.command.ts` and `remove-flight-from-rotation.command.ts`.
- [x] 3.2 Delete `application/query/rotation/get-last-flight-in-rotation.query.ts`.
- [x] 3.3 Delete the 2 actions under `infra/http/action/rotation/`.
- [x] 3.4 Remove all rotation imports, `controllers` entries, and `providers` entries from `src/modules/flights/flights.module.ts`.
- [x] 3.5 Remove the flight-rotation error classes (`FlightAlreadyAssignedToRotationError`, `FlightRotationNotMatchingError`, `FlightIncorrectStateToChangeRotationError`) from `src/modules/flights/model/error/flight.error.ts`.
- [x] 3.6 Remove rotation repository methods from `flights.repository.ts`: `getRotationIdByFlightId` (dead code), `addRotationForFlight`, `removeRotationForFlight`, `getLastFlightIdInRotation`, and the `rotationId: true` select entry.

## 4. Flight & user models / DTOs

- [x] 4.1 Remove the `Rotation` import and the `rotation` / `rotationId` properties from `src/modules/flights/model/flight.model.ts`.
- [x] 4.2 Remove `rotationId` from `src/modules/flights/model/event.model.ts` and the `OmitType` lists in `flight.dto.ts` (`CreateFlightRequest`, `GetFlightResponse`) and `event.dto.ts` (`FlightEventResponse`).
- [x] 4.3 Remove `currentRotationId` from `src/modules/users/model/user.model.ts`, and remove `setCurrentRotation()` + the `currentRotationId` mapping from `users.repository.ts`.

## 5. Domain events & listeners

- [x] 5.1 In `src/core/domain/events/dto/flight.events.ts`: remove the `FlightWasAddedToRotation` / `FlightWasRemovedFromRotation` enum members, the two event classes, and the `rotationId` field on `FlightEventPayload`.
- [x] 5.2 Remove `rotationId: ...` from every flight lifecycle command payload (~23 commands under `application/command/`, incl. `diversion/` and `emergency/`), `off-block-delay.listener.ts`, and `position.service.ts`.
- [x] 5.3 Remove the rotation `@OnEvent` subscriptions from `events.repository.ts`, `broadcast-flight-event.listener.ts`, and `flight-cache.listener.ts`.
- [x] 5.4 In `src/modules/users/application/event/external/flight-lifecycle.listener.ts`: remove the `GetLastFlightInRotationQuery` import and the rotation branches in `onPilotCheckedIn` and `onFlightWasClosed`.

## 6. Seed data

- [x] 6.1 Delete `prisma/seed/resource/rotations.seed.ts` and remove the `loadRotations` import + call from `prisma/seed/load-resources.ts`.
- [x] 6.2 Remove `rotationId` / `currentRotationId` fields (and their comment banners) from `prisma/seed/resource/flights.seed.ts` and `prisma/seed/resource/users.seed.ts`.

## 7. Tests

- [x] 7.1 Delete the dedicated rotation feature dirs: `features/flight/rotation/` and `features/operator/rotation/`.
- [x] 7.2 Remove `rotationId` / `rotation` / `currentRotationId` assertions from the remaining flight/user feature files, and delete rotation-only scenarios (e.g. "check-in that starts rotation", "close last flight in rotation").
- [x] 7.3 Remove `rotationId: null` from the unit-test fixtures in `report-arrival/off-block/takeoff.command.spec.ts` and `detect-arrival/off-block/takeoff.listener.spec.ts`.

## 8. Docs & final verification

- [x] 8.1 Remove rotation mentions from `CLAUDE.md` (functional-test domains), `README.md`, and the Swagger API description in `swagger.config.ts`.
- [x] 8.2 Run `docker compose exec app npm run build` and `npm run lint` — both clean, no dangling rotation references.
- [x] 8.3 Run `docker compose exec app npm test` (unit) and `npm run test:functional` (Cucumber) — all green.
