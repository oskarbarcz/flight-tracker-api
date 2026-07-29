## 1. Request DTO

- [ ] 1.1 Add `UpdateOwnProfileDto` in `src/modules/users/infra/http/request/update-own-profile.dto.ts` with `name?: string` (`@IsString() @IsNotEmpty() @IsOptional()`) and `pilotLicenseId?: string | null` (`@IsString() @IsOptional() @Matches(/^[A-Za-z]{2}-\d{5}$/)`), each with an `@ApiProperty({ required: false })` matching the wording used in `model/user.model.ts`.

## 2. Command

- [ ] 2.1 Add `UpdateOwnProfileCommand(userId, data: UpdateOwnProfileDto)` + `UpdateOwnProfileHandler` in `application/command/update-own-profile.command.ts`, delegating to `UsersRepository.update(userId, data)`.

## 3. HTTP action

- [ ] 3.1 Add `UpdateOwnProfileAction` in `infra/http/action/update-own-profile.action.ts`: `@Controller('/api/v1/user')`, `@Patch('/me')`, no `@Role` decorator, resolve the user from `request.user.sub` via `AuthorizedRequest`; assign `const command = new UpdateOwnProfileCommand(...)` then `commandBus.execute(command)`, then read back with `GetUserByIdQuery` and return `GetUserDto`.
- [ ] 3.2 Add Swagger metadata mirroring `UpdateUserAction` minus the forbidden case: `@ApiTags('user')`, `@ApiBearerAuth('jwt')`, `@ApiBody({ type: UpdateOwnProfileDto })`, `@ApiOkResponse({ type: GetUserDto })`, `@ApiBadRequestResponse({ type: GenericBadRequestResponse<UpdateOwnProfileDto> })`, `@ApiUnauthorizedResponse({ type: UnauthorizedResponse })`.

## 4. Module wiring

- [ ] 4.1 Register `UpdateOwnProfileHandler` in `providers` and `UpdateOwnProfileAction` in `controllers` of `users.module.ts`, placing the action **before** `UpdateUserAction` so `PATCH /me` is matched ahead of `PATCH :id`.

## 5. Functional tests

- [ ] 5.1 Add `features/user/user.me.update.feature` happy path: signed in as `cabin-crew@example.com` (Rick Doe, `fcf6f4bc-290d-43a9-843c-409cd47e143d`), `PATCH /api/v1/user/me` with a new `name` and `pilotLicenseId` returns `200` with the full user body showing both new values and every other field unchanged; end with "I set database to initial state".
- [ ] 5.2 Partial update: `PATCH /api/v1/user/me` with only `name` returns `200` and leaves `pilotLicenseId` at its seeded value.
- [ ] 5.3 Escalation attempts rejected with `400` and the `violations` map naming the offending property: `role`, `email`, `password`, `homeAirportId`, `simbriefUserId`, and `id`.
- [ ] 5.4 Pilot-license rules: `operations@example.com` (not cabin crew) sending `pilotLicenseId` is rejected; `cabin-crew@example.com` sending a malformed license (e.g. `UK-123`) gets `400` with the format message.
- [ ] 5.5 Actor matrix per the project convention: admin `200`, cabin-crew `200`, unauthenticated `401` — every authenticated role may edit its own profile, so there is no `403` case.
- [ ] 5.6 Cache-freshness scenarios, ordered so the cached reads run before the mutation in the same file cannot serve stale data: after `PATCH /me`, `GET /api/v1/user/me` shows the new name, and `GET /api/v1/flight/<a flight captained by the edited cabin crew member>` shows the new name and license in its captain block.

## 6. Verify

- [ ] 6.1 `docker compose exec app npm run lint` and `npm run build` pass.
- [ ] 6.2 `docker compose exec app npx cucumber-js features/user/user.me.update.feature` passes.
- [ ] 6.3 The full `features/user` suite still passes, confirming `PATCH /:id` and the `/me` reads are unaffected.
