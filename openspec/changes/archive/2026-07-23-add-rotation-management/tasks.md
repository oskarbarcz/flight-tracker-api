## 1. Data model & migration

- [x] 1.1 Add `Rotation` and `RotationLeg` models to `prisma/schema.prisma` (rotation: `id`, `operatorId`, `pilotId`, `status`, `createdAt`, `updatedAt`; leg: `id`, `rotationId`, `departure`, `arrival`, `offBlockTime`, `onBlockTime`, `flightId?`) with `@@unique(flightId)`, index on `rotationId` and `flightId`, and relations to `Operator`/`User`; add no field to `Flight`
- [x] 1.2 Generate the migration under `prisma/migrations/` (additive: two new tables, no changes to `flight`/`user`/`operator`) and run `prisma db push` against the dev DB
- [x] 1.3 Regenerate the Prisma client (`npx prisma generate`) and confirm imports resolve from `prisma/client/client`
- [x] 1.4 Add rotation seed fixtures in `prisma/seed/resource/rotations.seed.ts` (fixed random v4 UUIDs) covering draft, ready, in_progress, and finished states; wire into `prisma/seed/load-resources.ts`

## 2. Domain model

- [x] 2.1 Create `src/modules/rotations/model/rotation.model.ts` (API-shaped `Rotation`, `RotationStatus` enum draft|ready|in_progress|finished, branded `RotationId`)
- [x] 2.2 Create `src/modules/rotations/model/rotation-leg.model.ts` (leg with computed `blockTime` getter/mapper, departure/arrival, planned times)
- [x] 2.3 Create typed errors under `src/modules/rotations/model/error/*.error.ts` extending the core domain-error categories (not-found, invalid-transition/conflict, validation)

## 3. Repository

- [x] 3.1 Create `src/modules/rotations/infra/database/repository/rotations.repository.ts` (the only place injecting `PrismaService`): create rotation, add/update/remove leg, load by id with legs ordered by off-block time, list, update status, set/clear leg `flightId`, find leg by `flightId`

## 4. Application — commands & queries

- [x] 4.1 `create-rotation.command.ts` — persist a `draft` rotation for an operator + pilot
- [x] 4.2 `add-leg.command.ts` / `update-leg.command.ts` / `remove-leg.command.ts` — draft CRUD with per-leg validity (departure != arrival, offBlock < onBlock); enforce leg-set frozen and airports frozen once `ready`; reject editing a leg with a checked-in flight
- [x] 4.3 `mark-rotation-ready.command.ts` — require ≥2 legs and validate continuity chain (airport chain + non-overlap) ordered by off-block time; transition `draft → ready`
- [x] 4.4 `attach-flight-to-leg.command.ts` — dispatch `GetFlightQuery`; validate flight `created`, airports match leg, operator matches rotation, flight not already attached; set leg `flightId`
- [x] 4.5 `detach-flight-from-leg.command.ts` — clear leg `flightId` only while the flight is still `created`
- [x] 4.6 `get-rotation-by-id.query.ts` + `list-rotations.query.ts` (operator/pilot scoped); compute `blockTime` per leg on read
- [x] 4.7 `assert-rotation-exists` handler
- [x] 4.8 Follow the codebase convention of assigning `const command = new XCommand(...)` before `bus.execute(command)`

## 5. Application — event-driven transitions

- [x] 5.1 Create `src/modules/rotations/application/event/external/flight-lifecycle.listener.ts` subscribing to `flight.pilot-checked-in` and `flight.closed`
- [x] 5.2 On first check-in of any leg's flight: transition `ready → in_progress` (idempotent, guarded on prior state)
- [x] 5.3 On close of the last leg's flight (max planned off-block time): transition `in_progress → finished` (idempotent; earlier-leg closes are no-ops)

## 6. HTTP layer

- [x] 6.1 Create one action controller per endpoint under `infra/http/action/` with request DTOs: create rotation, add/update/remove leg, mark-ready, attach flight, detach flight (all `@Role(UserRole.Operations)`; import `UserRole` relatively)
- [x] 6.2 Create read actions for get rotation + list rotations as public (`@SkipAuth()`)
- [x] 6.3 Follow write-then-read idiom (dispatch command, then return via query); omit redundant Swagger response descriptions

## 7. Module wiring

- [x] 7.1 Create `src/modules/rotations/rotations.module.ts` declaring every action in `controllers` and every command/query/assert/listener + repository in `providers`
- [x] 7.2 Register `RotationsModule` in `src/app.module.ts`

## 8. Tests & docs

- [x] 8.1 Add Cucumber features under `features/rotation/` for the lifecycle (create → build legs → mark ready → attach → check-in advances → last close finishes) using seeded fixed-UUID rotations; assert full response bodies
- [x] 8.2 Add feature scenarios for attachment validation failures (wrong status, airport mismatch, operator mismatch, already-attached) and ready validation failures (<2 legs, broken chain, overlap)
- [x] 8.3 Add RBAC scenarios: writes 403 for non-ops / 401 unauthenticated; reads 200 while unauthenticated (public)
- [x] 8.4 Colocated Jest `*.spec.ts` for the flight-lifecycle listener transitions (first check-in → in_progress; last close → finished; earlier close no-op; idempotency)
- [x] 8.5 Update Swagger API description and `CLAUDE.md` module list to include `rotations`; align tests and seed statically before running the functional suite
- [x] 8.6 Run `npm run lint`, `npm test`, and `npm run test:functional` inside the `app` container until green
