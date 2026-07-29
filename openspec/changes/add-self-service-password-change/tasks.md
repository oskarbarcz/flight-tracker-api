## 1. Repository credential methods

- [ ] 1.1 Add `verifyPassword(userId: string, plain: string): Promise<boolean>` to `UsersRepository`: load via `findOneBy({ id: userId })`, return `false` when the user is missing or `password === null`, else `bcrypt.compare`.
- [ ] 1.2 Add `setPassword(userId: string, plain: string): Promise<void>` to `UsersRepository`: hash with `this.BCRYPT_SALT_ROUNDS` and update only the `password` column.
- [ ] 1.3 Add `hasPassword(userId: string): Promise<boolean>` (or return the loaded user from a small private helper) so the handler can distinguish "no password set" from "wrong password" without a second full read.

## 2. Session revocation

- [ ] 2.1 Add `removeAllSessionsForUserExcept(userId: string, sessionId: string)` to `SessionRepository` — `deleteMany({ where: { userId, id: { not: sessionId } } })`.
- [ ] 2.2 Add `closeAllForUserExcept(userId, sessionId)` to `SessionService`, delegating to 2.1.

## 3. Errors

- [ ] 3.1 Add `PasswordNotSetError extends ConflictError` to `src/modules/auth/model/error/auth.error.ts` (message: the account signs in with Google and has no password to change).
- [ ] 3.2 Add `NewPasswordMustDifferError extends BadRequestError` to the same file.

## 4. Request DTO

- [ ] 4.1 Add `ChangePasswordDto` in `src/modules/auth/infra/http/request/change-password.dto.ts`: `currentPassword` (`@IsString() @IsNotEmpty()`) and `newPassword` (`@IsString() @IsNotEmpty() @MinLength(8)`), each with `@ApiProperty`.

## 5. Command

- [ ] 5.1 Add `ChangePasswordCommand(userId, sessionId, currentPassword, newPassword)` + `ChangePasswordHandler` in `src/modules/auth/application/command/change-password.command.ts`, ordered: throw `PasswordNotSetError` when the account has no password; throw `InvalidCredentialsError` when `verifyPassword` fails; throw `NewPasswordMustDifferError` when the new password equals the current one; then `setPassword`; then `closeAllForUserExcept(userId, sessionId)`.

## 6. HTTP action

- [ ] 6.1 Add `ChangePasswordAction` in `src/modules/auth/infra/http/action/change-password.action.ts`: `@Controller('/api/v1/auth')`, `@Patch('password')`, `@HttpCode(HttpStatus.NO_CONTENT)`, no `@Role`; read `sub` and `session` from `AuthorizedRequest`, assign `const command = new ChangePasswordCommand(...)` then `commandBus.execute(command)`.
- [ ] 6.2 Add Swagger metadata: `@ApiTags('auth')`, `@ApiBearerAuth('jwt')`, `@ApiBody({ type: ChangePasswordDto })`, `@ApiNoContentResponse()`, `@ApiBadRequestResponse({ type: GenericBadRequestResponse<ChangePasswordDto> })`, `@ApiUnauthorizedResponse({ type: UnauthorizedResponse })`, `@ApiConflictResponse` for the no-password case.

## 7. Module wiring

- [ ] 7.1 Register `ChangePasswordHandler` in `providers` and `ChangePasswordAction` in `controllers` of `auth.module.ts`.

## 8. Seed data

- [ ] 8.1 Add a Google-only seed user to `prisma/seed/resource/users.seed.ts` — `password: null`, a `googleId` (random v4-generated user id, Google `sub` a fresh numeric string), role Operations — and append it to the create loop. This is the fixture for the 409 scenario; no existing seed user has a null password.
- [ ] 8.2 Confirm the new user's position in the create loop does not disturb the heap order the user-list feature depends on (append last, and re-check `features/user/user.list.feature` expectations, which assert the full list).

## 9. Functional tests

- [ ] 9.1 Add `features/auth/auth.password-change.feature` happy path: signed in as `operations@example.com`, `PATCH /api/v1/auth/password` with the seeded `P@$$w0rd` and a new password returns `204`; then sign-in with the new password returns `200`, and sign-in with `P@$$w0rd` returns `401`; end with "I set database to initial state".
- [ ] 9.2 Wrong current password returns `401` with the generic credentials message, and the seeded password still signs in afterwards.
- [ ] 9.3 The Google-only seed user (signed in via the Google ID-token fixture flow used by `features/auth/auth.google-sign-in.feature`) gets `409`.
- [ ] 9.4 `admin@example.com` — which has **both** a password and a `googleId` — changes its password successfully, pinning decision 2.
- [ ] 9.5 Validation: `newPassword` shorter than 8 characters returns `400` with the `violations` map; `newPassword` equal to `currentPassword` returns `400`; a missing field returns `400`.
- [ ] 9.6 Session revocation: sign in twice as the same user, change the password using the first session's access token, then confirm `POST /api/v1/auth/refresh` with the second session's refresh token returns `401` while the first session's refresh token still returns `200`.
- [ ] 9.7 Actor matrix: any authenticated role may change its own password (admin `204`, cabin-crew `204` — run in separate scenarios so each resets), unauthenticated `401`.

## 10. Verify

- [ ] 10.1 `docker compose exec app npm run lint` and `npm run build` pass.
- [ ] 10.2 `docker compose exec app npx cucumber-js features/auth/auth.password-change.feature` passes.
- [ ] 10.3 The full `features/auth` and `features/user` suites still pass — `features/user/user.list.feature` in particular, since a seed user was added.
