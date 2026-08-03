## 1. Prerequisites

- [x] 1.1 ~~Confirm `add-forgotten-password-reset` has landed~~ — it had **not**. The Mailgun provider was built first (same shape as its design), and the minimal `UserToken` machinery (table, repository with supersede-on-issue, the 5-minute guard, hashed single-use tokens) plus `features/_context/mail.context.ts` and `FRONTEND_BASE_URL` were built here instead. `add-forgotten-password-reset` now only needs to add `password_reset` to `UserTokenType` and its own handlers.
- [x] 1.2 Confirm `add-self-service-password-change` has landed: `UsersRepository.verifyPassword` and `PasswordNotSetError` exist.

## 2. Prisma schema

- [x] 2.1 Add `email_change` to the `UserTokenType` enum and a nullable `newEmail String?` column to `UserToken` in `prisma/schema.prisma`. (`UserTokenType`/`UserToken` created here — see 1.1.)
- [x] 2.2 Create and apply the migration; run `docker compose exec app npx prisma db push` and `npx prisma generate` locally.

## 3. Token repository

- [x] 3.1 Extend `UserTokenRepository.issue` to accept an optional `newEmail` payload written to the row, keeping the existing signature working for `password_reset`.
- [x] 3.2 Ensure `findValid` returns `newEmail` alongside the row so the confirm handler does not need a second read.

## 4. Users repository

- [x] 4.1 Add `setEmail(userId, email)` to `UsersRepository`: update the `email` column and invalidate the `USER_ME` cache entry for that user (`cacheByUser(CACHE_KEYS.USER_ME, userId)`).
- [x] 4.2 Add `isEmailTaken(email: string, exceptUserId?: string): Promise<boolean>` to `UsersRepository`.

## 5. Errors and DTOs

- [x] 5.1 Add `EmailAlreadyInUseError extends ConflictError`, `NewEmailMustDifferError extends BadRequestError`, and `InvalidEmailChangeTokenError extends BadRequestError` to `src/modules/auth/model/error/auth.error.ts`.
- [x] 5.2 Add `RequestEmailChangeDto` (`newEmail`: `@IsEmail() @IsNotEmpty()`; `currentPassword`: `@IsString() @IsNotEmpty()`) and `ConfirmEmailChangeDto` (`token`: `@IsString() @IsNotEmpty()`) under `src/modules/auth/infra/http/request/`.

## 6. Domain event and mail listener

- [x] 6.1 Add `EmailChangeRequestedEvent extends DomainEvent` carrying `{ userId, currentEmail, newEmail, token }` to `src/core/domain/events/dto/user-credentials.events.ts`, plus its enum member.
- [x] 6.2 Add the two message types to the Mailgun provider's `MailMessageType` (confirmation to the new address, notification to the current one).
- [x] 6.3 Add `src/modules/auth/application/event/internal/email-change-mail.listener.ts`: on the event, send the confirmation message to `newEmail` containing `${FRONTEND_BASE_URL}/confirm-email?token=<raw>` and the 24-hour validity, and the notification message to `currentEmail` with no action link; catch and log failures per message so one failing send does not skip the other.
- [x] 6.4 Add a colocated `email-change-mail.listener.spec.ts`: both messages are sent to the right recipients, only the new-address message contains the token, and a rejection from one send does not prevent the other.

## 7. Commands

- [x] 7.1 Add `RequestEmailChangeCommand(userId, newEmail, currentPassword)` + handler, in this order: load the user (`UserNotFoundError`); throw `PasswordNotSetError` when `password === null`; throw `InvalidCredentialsError` when `verifyPassword` fails; throw `NewEmailMustDifferError` when `newEmail` equals the current address (case-insensitive compare); throw `EmailAlreadyInUseError` when `isEmailTaken(newEmail, userId)`; return silently when `findRecentUnconsumed(userId, email_change, 5 min)` returns a row; otherwise `issue(userId, email_change, 24h, newEmail)` and emit `EmailChangeRequestedEvent`.
- [x] 7.2 Add `ConfirmEmailChangeCommand(token)` + handler: `findValid(email_change, token)` or throw `InvalidEmailChangeTokenError`; throw `EmailAlreadyInUseError` when `isEmailTaken(row.newEmail, row.userId)`; `setEmail(row.userId, row.newEmail)`; `consume(row.id)`; `SessionService.closeAllForUser(row.userId)`.
- [x] 7.3 Colocated `request-email-change.command.spec.ts` and `confirm-email-change.command.spec.ts` cover the rejection order, the re-send guard, and the Google-only (`PasswordNotSetError`) path that has no seed fixture — see 11.3.

## 8. HTTP actions

- [x] 8.1 Add `RequestEmailChangeAction`: `@Controller('/api/v1/auth')`, `@Post('email-change')`, `@HttpCode(HttpStatus.ACCEPTED)`, authenticated with no `@Role`, user id from `AuthorizedRequest`; Swagger `@ApiTags('auth')`, `@ApiBearerAuth('jwt')`, `@ApiAcceptedResponse()`, `@ApiBadRequestResponse`, `@ApiUnauthorizedResponse`, `@ApiConflictResponse`.
- [x] 8.2 Add `ConfirmEmailChangeAction`: `@Post('email-change/confirm')`, `@SkipAuth()`, `@HttpCode(HttpStatus.NO_CONTENT)`; Swagger with `@ApiNoContentResponse()`, `@ApiBadRequestResponse`, `@ApiConflictResponse`.

## 9. Module wiring

- [x] 9.1 Register both handlers and the listener in `providers`, and both actions in `controllers`, of `auth.module.ts`. (Also `UserTokenRepository` in `providers` and `MailgunModule` in `imports`.)

## 10. Seed data

- [x] 10.1 Extend `prisma/seed/resource/user-token.seed.ts` with fixed-uuid `email_change` fixtures on distinct users, each with a literal raw token recorded in the seed: a valid unexpired token (Michael Doe), an expired one (Emma Doe), a consumed one (Diana Doe), and one whose `newEmail` is an address already held by another seeded user (Claudia Doe → `cabin-crew@example.com`).
- [x] 10.2 Verify the added rows do not disturb `features/user/user.list.feature` or any other full-body assertion — full `features/user` suite re-run green.

## 11. Functional tests

- [x] 11.1 Add `features/auth/auth.email-change.feature`. Happy path on Alan Doe: `202`, both emails asserted, token extracted from the confirmation email, `204`, sign-in moves to the new address and the old one returns `401`.
- [x] 11.2 Pending-state scenarios: sign-in with the old address still `200`, sign-in with the pending address `401`, `GET /api/v1/user/me` still shows the old address, and — added once `add-forgotten-password-reset` landed — a password reset while a change is pending sends its link to the **old** address, while a reset requested for the pending address sends nothing.
- [x] 11.3 Rejections at request time: wrong `currentPassword` → `401`; own address → `400`; another seeded user's address → `409`; malformed address → `400` with the `violations` map; unauthenticated → `401`; cabin crew can also request one. **Not covered functionally:** the Google-only `409`. A Google-only seed user now exists (Grace Doe), but she cannot hold a session — signing her in needs an ID token signed by the mock JWKS keypair, whose private half is not in the repo — so the path stays unit-tested in `request-email-change.command.spec.ts`.
- [x] 11.4 Token rejections using the seeded fixtures: expired → `400`; consumed → `400`; unknown → `400`; the collision fixture → `409` with the account's address unchanged; the valid seeded token confirmed twice → second call `400`.
- [x] 11.5 Re-send suppression: two consecutive requests both return `202` and exactly one confirmation email exists. `TestMailgunClient` writes one file per message (`<type>_<recipient>_<uuid>.json`) so a suppressed re-send is distinguishable from a second send.
- [x] 11.6 Session revocation: the seeded long-lived refresh token no longer refreshes after the change is confirmed.
- [x] 11.7 The confirm endpoint behaves identically with and without a bearer token — one scenario per case.
- [x] 11.8 Actor coverage per the repo convention: the request endpoint is exercised as admin, operations, cabin crew and unauthorized (`401`); the confirm endpoint, being `@SkipAuth()`, as unauthorized and with a bearer.

## 12. Documentation

- [x] 12.1 Add the two endpoints and the pending-address semantics to `README.md` (§ Changing your own email address).
- [x] 12.2 Add one sentence to the README's Google Sign-In section explaining that a mutable email is why `POST /api/v1/auth/google` must keep resolving by `googleId` only.

## 13. Verify

- [x] 13.1 `docker compose exec app npm run lint` and `npm run build` pass.
- [x] 13.2 `docker compose exec app npm test` passes — 23 suites / 121 tests.
- [x] 13.3 `docker compose exec app npx cucumber-js features/auth/auth.email-change.feature` passes — 19 scenarios.
- [x] 13.4 The full functional suite passes — 901 scenarios / 4226 steps.
