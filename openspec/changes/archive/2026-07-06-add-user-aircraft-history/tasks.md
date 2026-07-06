## 1. Schema & migration

- [x] 1.1 Add `UserAircraft` model to `prisma/schema.prisma` (`id`, `userId`, `aircraftId`, `flightId`, `createdAt`, `@@index([userId])`, `@@map("user_aircraft")`) with `onDelete: Cascade` on the user relation.
- [x] 1.2 Add back-relations `userAircraft UserAircraft[]` on `User`, `Aircraft`, and `Flight`.
- [x] 1.3 Generate the migration (`prisma/migrations/20260706120000_add_user_aircraft/migration.sql`) creating the `user_aircraft` table.
- [x] 1.4 Append the backfill to the migration SQL: `INSERT INTO user_aircraft (...) SELECT gen_random_uuid(), "captainId", "aircraftId", "id", CURRENT_TIMESTAMP FROM "flight" WHERE "captainId" IS NOT NULL;`
- [x] 1.5 Regenerate the Prisma client (`npx prisma generate`, output stays at `prisma/client/`).

## 2. Write path (event listener)

- [x] 2.1 Create `UserAircraftRepository` (`infra/database/repository/user-aircraft.repository.ts`) with a `create({ userId, aircraftId, flightId })` method.
- [x] 2.2 Create `UserAircraftListener` (`application/event/external/user-aircraft.listener.ts`) `@OnEvent(FlightEventType.PilotCheckedIn)` that inserts a row from `{ actorId, aircraftId, flightId }`.
- [x] 2.3 Register the listener and repository in `UsersModule` providers.

## 3. Read path (query + endpoint)

- [x] 3.1 Add `UserAircraftRepository.findByUser(userId)` — `findMany where userId`, `orderBy createdAt desc`, selecting aircraft `{ id, registration, type, livery }` and `flight.operator`; map to the model, resolving `airframe` from `type` via `findAirframeByType`.
- [x] 3.2 Add `UserAircraftEntry` response DTO (`model/user-aircraft.model.ts`) with Swagger `@ApiProperty` metadata: `id`, `registration`, `airframe`, `livery`, `operator`, `flightId`.
- [x] 3.3 Add `ListUserAircraftQuery` + handler (`application/query/list-user-aircraft.query.ts`) delegating to the repository.
- [x] 3.4 Add `GetMyAircraftAction` (`infra/http/action/get-my-aircraft.action.ts`), `GET /api/v1/user/me/aircraft`, JWT-protected, reads `request.user.sub`, dispatches the query (extract `const query = new ListUserAircraftQuery(...)` before `execute`).
- [x] 3.5 Register the query handler and controller in `UsersModule`.

## 4. Seed & tests

- [x] 4.1 Seed `user_aircraft` fixtures with fixed v4 UUIDs, consistent with existing captained flights in the seed data.
- [x] 4.2 Add a Cucumber scenario under `features/user/` for `GET /me/aircraft`, asserting the full response body (newest-first ordering, operator from the flight).
- [x] 4.3 Add a scenario asserting an empty list for a user with no captained flights, and that an unauthenticated request returns 401.
- [x] 4.4 Extend `flight.check-in-pilot.feature`: after check-in, assert the just-flown aircraft appears (newest-first) in `GET /me/aircraft` — proves the event write path end-to-end.

## 5. Verify

- [x] 5.1 `docker compose exec app npm run lint` and `format:fix`.
- [x] 5.2 `docker compose exec app npm run build`.
- [x] 5.3 `docker compose exec app npx cucumber-js features/user/user.aircraft.list.feature` for the new scenarios (3 passed; full `features/user` suite: 64 passed).
- [x] 5.4 Confirm the backfill on a seeded DB: 18 captained flights → 18 rows; 6 captain-less flights skipped.
