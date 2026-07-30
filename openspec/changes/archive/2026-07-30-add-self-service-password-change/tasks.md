## 1. Repository credential methods

- [x] 1.1 Add `verifyPassword(userId: string, plain: string): Promise<boolean>` to `UsersRepository`: load via `findOneBy({ id: userId })`, return `false` when the user is missing or `password === null`, else `bcrypt.compare`.
- [x] 1.2 Add `setPassword(userId: string, plain: string): Promise<void>` to `UsersRepository`: hash with `this.BCRYPT_SALT_ROUNDS` and update only the `password` column.
- [x] 1.3 Add `hasPassword(userId: string): Promise<boolean>` (or return the loaded user from a small private helper) so the handler can distinguish "no password set" from "wrong password" without a second full read.

## 2. Session revocation

- [x] 2.1 Add `removeAllSessionsForUserExcept(userId: string, sessionId: string)` to `SessionRepository` — `deleteMany({ where: { userId, id: { not: sessionId } } })`.
- [x] 2.2 Add `closeAllForUserExcept(userId, sessionId)` to `SessionService`, delegating to 2.1.

## 3. Errors

- [x] 3.1 Add `PasswordNotSetError extends ConflictError` to `src/modules/auth/model/error/auth.error.ts` (message: the account signs in with Google and has no password to change).
- [x] 3.2 Add `NewPasswordMustDifferError extends BadRequestError` to the same file.

## 4. Request DTO

- [x] 4.1 Add `ChangePasswordDto` in `src/modules/auth/infra/http/request/change-password.dto.ts`: `currentPassword` (`@IsString() @IsNotEmpty()`) and `newPassword` (`@IsString() @IsNotEmpty()`), each with `@ApiProperty`.
- [x] 4.2 Enforce a strong `newPassword` with `@IsStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1, minSymbols: 1 })` and one custom message stating the whole policy. Leave `currentPassword` policy-free — it is checked against the stored hash, so existing weak passwords can still authorise a change.

## 5. Command

- [x] 5.1 Add `ChangePasswordCommand(userId, sessionId, currentPassword, newPassword)` + `ChangePasswordHandler` in `src/modules/auth/application/command/change-password.command.ts`, ordered: throw `PasswordNotSetError` when the account has no password; throw `InvalidCredentialsError` when `verifyPassword` fails; throw `NewPasswordMustDifferError` when the new password equals the current one; then `setPassword`; then `closeAllForUserExcept(userId, sessionId)`.

## 6. HTTP action

- [x] 6.1 Add `ChangePasswordAction` in `src/modules/auth/infra/http/action/change-password.action.ts`: `@Controller('/api/v1/auth')`, `@Patch('password')`, `@HttpCode(HttpStatus.NO_CONTENT)`, no `@Role`; read `sub` and `session` from `AuthorizedRequest`, assign `const command = new ChangePasswordCommand(...)` then `commandBus.execute(command)`.
- [x] 6.2 Add Swagger metadata: `@ApiTags('auth')`, `@ApiBearerAuth('jwt')`, `@ApiBody({ type: ChangePasswordDto })`, `@ApiNoContentResponse()`, `@ApiBadRequestResponse({ type: GenericBadRequestResponse<ChangePasswordDto> })`, `@ApiUnauthorizedResponse({ type: UnauthorizedResponse })`, `@ApiConflictResponse` for the no-password case.

## 7. Module wiring

- [x] 7.1 Register `ChangePasswordHandler` in `providers` and `ChangePasswordAction` in `controllers` of `auth.module.ts`.

## 8. Seed data

- [x] 8.1 **Deferred to the password-reset change (#192), not done here.** A Google-only seed user is only useful with a way to authenticate as it, and no ID token can be minted for a new `googleId` — the repo holds only the public JWKS (`docker/mock/google.json`), and the one spare fixture token is load-bearing for the "not linked to any user" scenario. Adding the user now would churn `features/user/user.list.feature`'s full-list assertions for no coverage gain. #192's reset request is unauthenticated, so the user is directly usable there.
- [x] 8.2 Not applicable — no seed user was added, so the user-list heap order is untouched.
- [x] 8.3 Add `prisma/seed/resource/session.seed.ts` (`loadSessions`, wired into `loadResources` after `loadUsers`): one `JwtRefreshToken` row for the operations user with a fixed session uuid, holding the bcrypt hash of a long-lived ES256 refresh token signed with the repo's `JWT_PRIVATE_KEY`. This is the "other device" for the revocation scenario.

## 9. Functional tests

- [x] 9.1 Add `features/auth/auth.password-change.feature` happy path: signed in as `operations@example.com`, `PATCH /api/v1/auth/password` with the seeded `P@$$w0rd` and a new password returns `204`; then sign-in with the new password returns `200`, and sign-in with `P@$$w0rd` returns `401`; end with "I set database to initial state".
- [x] 9.2 Wrong current password returns `401` with the generic credentials message, and the seeded password still signs in afterwards.
- [x] 9.3 **Covered by unit test, not a scenario** (see 8.1): `change-password.command.spec.ts` asserts a passwordless account raises `PasswordNotSetError` and that `verifyPassword` is never reached, so bcrypt never sees a null.
- [x] 9.4 `admin@example.com` — which has **both** a password and a `googleId` — changes its password successfully, pinning decision 2.
- [x] 9.5 Validation: three strength rejections (too short; long but all-lowercase; long with upper, lower and a number but no symbol) each return `400` with the policy message; a missing field returns `400`.
- [x] 9.5.1 `newPassword` equal to `currentPassword` returns `400` with the must-differ message. Reaching that branch needs both values to be strong, so the scenario first changes the password to a compliant value using the acting session (which survives the change), then submits that same value again.
- [x] 9.6 Session revocation, via the seeded session rather than two sign-ins (the context holds one token per role): the seeded refresh token refreshes successfully, then after a password change the same token returns `401` with `Session is no longer valid.`. The acting session's survival is asserted in the unit test, which pins `closeAllForUserExcept(userId, actingSessionId)` and that `closeAllForUser` is never called.
- [x] 9.7 Add `I send a {string} request to {string} with bearer token {string}` to `features/_context/rest-api.context.ts` — a stateless step that sends an explicit token, needed to exercise a seeded session.
- [x] 9.8 Add a regression scenario to `features/auth/auth.refresh.feature`: a validly signed refresh token naming a session that does not exist returns `401` with `Session is no longer valid.`, not the `500` this returned before the fix.
- [x] 9.7 Actor matrix: any authenticated role may change its own password (admin `204`, cabin-crew `204` — run in separate scenarios so each resets), unauthenticated `401`.

## 10. Revoked-session fix

- [x] 10.1 `SessionRepository.update` returns the `updateMany` count instead of calling `update` on a possibly-deleted row (which raised Prisma `P2025` → `500`).
- [x] 10.2 `SessionService.renew` throws the new `SessionNoLongerValidError extends UnauthorizedError` when that count is `0`, so refreshing a revoked or unknown session is a `401`.

## 11. Verify

- [x] 11.1 `docker compose exec app npm run lint` passes.
- [x] 11.2 `docker compose exec app npm run build` passes (run last: building while `start:dev` watches crashes the dev server, so restart `app` afterwards).
- [x] 11.3 `docker compose exec app npm test -- change-password` passes — 5 tests.
- [x] 11.4 `docker compose exec app npx cucumber-js features/auth` passes — 33 scenarios, including the 9 password-change ones.
- [x] 11.5 `docker compose exec app npx cucumber-js features/user` passes — 85 scenarios.
- [x] 11.6 The full functional suite passes — 852 scenarios. Two earlier runs failed once each (the known `40P01` reset deadlock, and one intermittent body-key-count mismatch that did not reproduce across three subsequent full runs).
