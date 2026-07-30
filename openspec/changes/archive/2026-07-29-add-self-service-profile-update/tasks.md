## 1. Request DTO

- [x] 1.1 Add `UpdateOwnProfileDto` in `src/modules/users/infra/http/request/update-own-profile.dto.ts` with `name?: string` (`@IsString() @IsNotEmpty() @IsOptional()`) and `pilotLicenseId?: string | null` (`@IsString() @IsOptional() @Matches(/^[A-Za-z]{2}-\d{5}$/)`), each with an `@ApiProperty({ required: false })` matching the wording used in `model/user.model.ts`.
- [x] 1.2 Add `homeAirportId?: string` to the DTO, guarded by `@ValidateIf((profile) => profile.homeAirportId !== undefined)` + `@IsUUID()` so an omitted field is skipped while an explicit `null` is rejected (a cabin crew member must keep a home airport).
- [x] 1.3 Add `simbriefUserId?: string | null` to the DTO (`@IsString() @IsOptional()`), clearable by sending `null`.

## 2. Command

- [x] 2.1 Add `UpdateOwnProfileCommand(userId, data: UpdateOwnProfileDto)` + `UpdateOwnProfileHandler` in `application/command/update-own-profile.command.ts`, delegating to `UsersRepository.update(userId, data)`.

## 3. Own-user read shape

- [x] 3.1 Add `GetOwnUserDto extends OmitType(User, ['password'])` to `infra/http/request/get-user.dto.ts` — the shared user response plus `simbriefUserId`, which `GetUserDto` omits.
- [x] 3.2 Add `UsersRepository.findOwnById(id)` returning `GetOwnUserDto` (throws `UserNotFoundError` when missing).
- [x] 3.3 Add `GetOwnUserQuery(userId)` + `GetOwnUserHandler` in `application/query/get-own-user.query.ts`.
- [x] 3.4 Switch `GetCurrentUserAction` to `GetOwnUserQuery` / `GetOwnUserDto`, so `GET /api/v1/user/me` exposes `simbriefUserId`. Administrative reads and the user list keep `GetUserDto`.

## 4. Home airport existence

- [x] 4.1 In `UpdateOwnProfileHandler`, inject `QueryBus` and dispatch `AssertAirportExistsQuery` (from the `airports` module) when `data.homeAirportId` is present, before calling the repository — mirroring `UpdateAircraftHandler`'s `baseAirportId` check. No module import needed; the CQRS bus is global.
- [x] 4.2 Add the same assert to `CreateUserHandler` and `UpdateUserHandler`: `homeAirportId` is a raw foreign key there too, so a well-formed UUID for a missing airport previously surfaced as a Prisma error instead of a domain error.

## 5. HTTP action

- [x] 5.1 Add `UpdateOwnProfileAction` in `infra/http/action/update-own-profile.action.ts`: `@Controller('/api/v1/user')`, `@Patch('/me')`, no `@Role` decorator, resolve the user from `request.user.sub` via `AuthorizedRequest`; assign `const command = new UpdateOwnProfileCommand(...)` then `commandBus.execute(command)`, then read back with `GetOwnUserQuery` and return `GetOwnUserDto`.
- [x] 5.2 Add Swagger metadata mirroring `UpdateUserAction` minus the forbidden case: `@ApiTags('user')`, `@ApiBearerAuth('jwt')`, `@ApiBody({ type: UpdateOwnProfileDto })`, `@ApiOkResponse({ type: GetOwnUserDto })`, `@ApiBadRequestResponse({ type: GenericBadRequestResponse<UpdateOwnProfileDto> })`, `@ApiUnauthorizedResponse({ type: UnauthorizedResponse })`.

## 6. Module wiring

- [x] 6.1 Register `UpdateOwnProfileHandler` and `GetOwnUserHandler` in `providers`, and `UpdateOwnProfileAction` in `controllers`, of `users.module.ts` — the action **before** `UpdateUserAction` so `PATCH /me` is matched ahead of `PATCH :id`. Confirmed in the router log.

## 7. Functional tests

- [x] 7.1 Add `features/user/user.me.update.feature` happy path: signed in as `cabin-crew@example.com` (Rick Doe, `fcf6f4bc-290d-43a9-843c-409cd47e143d`), `PATCH /api/v1/user/me` with a new `name` and `pilotLicenseId` returns `200` with the full user body showing both new values and every other field unchanged; end with "I set database to initial state".
- [x] 7.2 Partial update: `PATCH /api/v1/user/me` with only `name` returns `200` and leaves `pilotLicenseId` at its seeded value.
- [x] 7.3 Escalation attempts rejected with `400` and the `violations` map naming the offending property: `role`, `email`, `password`, `id`, `currentFlightId`, and `lastAirportId`.
- [x] 7.4 Pilot-license rules: `operations@example.com` (not cabin crew) sending `pilotLicenseId` is rejected; `cabin-crew@example.com` sending a malformed license (`UK-123`) gets `400` with the format message; clearing with `null` returns `200`.
- [x] 7.5 Home-airport rules: a cabin crew member changing `homeAirportId` returns `200`; `operations@example.com` sending one gets `400` ("Only CabinCrew can have a home airport."); an explicit `null` and a malformed value each get `400` with the `homeAirportId must be a UUID` violation; a well-formed UUID for a non-existent airport gets `404` and a follow-up read shows the home airport unchanged.
- [x] 7.6 Simbrief rules: a cabin crew member and an operations user each set `simbriefUserId` and see it echoed in the response; clearing with `null` returns `200`.
- [x] 7.7 Actor matrix per the project convention: admin `200`, cabin-crew `200`, unauthenticated `401` — every authenticated role may edit its own profile, so there is no `403` case.
- [x] 7.8 Cache-freshness scenario: after `PATCH /me`, `GET /api/v1/user/me` shows the new values; the scenario then restores the seeded values through a second `PATCH` and re-reads, so the 60-second `USER_ME` cache is left holding correct data rather than a mutation the database reset has since rolled back.
- [x] 7.9 Pin the admin paths too: `features/user/user.create.feature` and `features/user/user.update.feature` each gain a scenario submitting a non-existent airport and expecting `404`.
- [x] 7.10 Add the additive `simbriefUserId` field to the existing `/me` assertions in `features/user/user.me.feature` (3 bodies) and `features/user/user.travel.create.feature` (1 body).
- [x] 7.11 **Not covered:** no scenario asserts pilot-card freshness. The only HTTP surfaces are `GET /api/v1/flight/:id` (cached 60s and not invalidated by a user write, so asserting there would read state left by the flight suite and poison later flight scenarios) and `GET /api/v1/flight` (uncached but returns the whole paginated list, which the exact-key body compare cannot assert selectively). See design.md risks.

## 8. Verify

- [x] 8.1 `docker compose exec app npm run lint` passes.
- [x] 8.2 `docker compose exec app npx cucumber-js features/user/user.me.update.feature` passes — 19 scenarios.
- [x] 8.3 The full `features/user` suite passes — 85 scenarios. Three consecutive clean runs before the airport check was added (one intermediate run failed on the known seed-reset/cache flake and did not reproduce).
- [x] 8.4 `docker compose exec app npm run build` passes (run last: building while `start:dev` watches crashes the dev server, so restart `app` afterwards).
- [x] 8.5 The full functional suite passes — 839 scenarios before the airport check, re-run after it since the admin user paths changed.
