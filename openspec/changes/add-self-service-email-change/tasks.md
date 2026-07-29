## 1. Prerequisites

- [ ] 1.1 Confirm `add-forgotten-password-reset` has landed: Mailgun provider, `UserToken` table with supersede-on-issue and the 5-minute guard, and `features/_context/mail.context.ts` all exist.
- [ ] 1.2 Confirm `add-self-service-password-change` has landed: `UsersRepository.verifyPassword` and `PasswordNotSetError` exist.

## 2. Prisma schema

- [ ] 2.1 Add `email_change` to the `UserTokenType` enum and a nullable `newEmail String?` column to `UserToken` in `prisma/schema.prisma`.
- [ ] 2.2 Create and apply the migration; run `docker compose exec app npx prisma db push` and `npx prisma generate` locally.

## 3. Token repository

- [ ] 3.1 Extend `UserTokenRepository.issue` to accept an optional `newEmail` payload written to the row, keeping the existing signature working for `password_reset`.
- [ ] 3.2 Ensure `findValid` returns `newEmail` alongside the row so the confirm handler does not need a second read.

## 4. Users repository

- [ ] 4.1 Add `setEmail(userId, email)` to `UsersRepository`: update the `email` column and invalidate the `USER_ME` cache entry for that user (`cacheByUser(CACHE_KEYS.USER_ME, userId)`).
- [ ] 4.2 Add `isEmailTaken(email: string, exceptUserId?: string): Promise<boolean>` to `UsersRepository`.

## 5. Errors and DTOs

- [ ] 5.1 Add `EmailAlreadyInUseError extends ConflictError`, `NewEmailMustDifferError extends BadRequestError`, and `InvalidEmailChangeTokenError extends BadRequestError` to `src/modules/auth/model/error/auth.error.ts`.
- [ ] 5.2 Add `RequestEmailChangeDto` (`newEmail`: `@IsEmail() @IsNotEmpty()`; `currentPassword`: `@IsString() @IsNotEmpty()`) and `ConfirmEmailChangeDto` (`token`: `@IsString() @IsNotEmpty()`) under `src/modules/auth/infra/http/request/`.

## 6. Domain event and mail listener

- [ ] 6.1 Add `EmailChangeRequestedEvent extends DomainEvent` carrying `{ userId, currentEmail, newEmail, token }` to `src/core/domain/events/dto/user-credentials.events.ts`, plus its enum member.
- [ ] 6.2 Add the two message types to the Mailgun provider's `MailMessageType` (confirmation to the new address, notification to the current one).
- [ ] 6.3 Add `src/modules/auth/application/event/internal/email-change-mail.listener.ts`: on the event, send the confirmation message to `newEmail` containing `${FRONTEND_BASE_URL}/confirm-email?token=<raw>` and the 24-hour validity, and the notification message to `currentEmail` with no action link; catch and log failures per message so one failing send does not skip the other.
- [ ] 6.4 Add a colocated `email-change-mail.listener.spec.ts`: both messages are sent to the right recipients, only the new-address message contains the token, and a rejection from one send does not prevent the other.

## 7. Commands

- [ ] 7.1 Add `RequestEmailChangeCommand(userId, newEmail, currentPassword)` + handler, in this order: load the user (`UserNotFoundError`); throw `PasswordNotSetError` when `password === null`; throw `InvalidCredentialsError` when `verifyPassword` fails; throw `NewEmailMustDifferError` when `newEmail` equals the current address (case-insensitive compare); throw `EmailAlreadyInUseError` when `isEmailTaken(newEmail, userId)`; return silently when `findRecentUnconsumed(userId, email_change, 5 min)` returns a row; otherwise `issue(userId, email_change, 24h, newEmail)` and emit `EmailChangeRequestedEvent`.
- [ ] 7.2 Add `ConfirmEmailChangeCommand(token)` + handler: `findValid(email_change, token)` or throw `InvalidEmailChangeTokenError`; throw `EmailAlreadyInUseError` when `isEmailTaken(row.newEmail, row.userId)`; `setEmail(row.userId, row.newEmail)`; `consume(row.id)`; `SessionService.closeAllForUser(row.userId)`.

## 8. HTTP actions

- [ ] 8.1 Add `RequestEmailChangeAction`: `@Controller('/api/v1/auth')`, `@Post('email-change')`, `@HttpCode(HttpStatus.ACCEPTED)`, authenticated with no `@Role`, user id from `AuthorizedRequest`; Swagger `@ApiTags('auth')`, `@ApiBearerAuth('jwt')`, `@ApiAcceptedResponse()`, `@ApiBadRequestResponse`, `@ApiUnauthorizedResponse`, `@ApiConflictResponse`.
- [ ] 8.2 Add `ConfirmEmailChangeAction`: `@Post('email-change/confirm')`, `@SkipAuth()`, `@HttpCode(HttpStatus.NO_CONTENT)`; Swagger with `@ApiNoContentResponse()`, `@ApiBadRequestResponse`, `@ApiConflictResponse`.

## 9. Module wiring

- [ ] 9.1 Register both handlers and the listener in `providers`, and both actions in `controllers`, of `auth.module.ts`.

## 10. Seed data

- [ ] 10.1 Extend `prisma/seed/resource/user-token.seed.ts` with fixed-uuid `email_change` fixtures on distinct users, each with a literal raw token recorded in the seed: a valid unexpired token, an expired one, a consumed one, and one whose `newEmail` is an address already held by another seeded user (the confirmation-time-collision case).
- [ ] 10.2 Verify the added rows do not disturb `features/user/user.list.feature` or any other full-body assertion (new rows are in `user_token` only, but re-run the user suite to be sure).

## 11. Functional tests

- [ ] 11.1 Add `features/auth/auth.email-change.feature`. Happy path: clear the mail directory; signed in as `operations@example.com`, `POST /api/v1/auth/email-change` with a fresh address and `P@$$w0rd` returns `202`; a confirmation email to the new address and a notification to `operations@example.com` are both asserted; extract the token, `POST /api/v1/auth/email-change/confirm` returns `204`; sign-in with the new address succeeds and with the old address returns `401`; reset the database at the end.
- [ ] 11.2 Pending-state scenarios, all after a request and before any confirmation: sign-in with the old address still returns `200`; sign-in with the pending address returns `401`; `GET /api/v1/user/me` still shows the old address; `POST /api/v1/auth/password-reset` for the old address still sends a reset email to the old address.
- [ ] 11.3 Rejections at request time: wrong `currentPassword` → `401`; the account's own address → `400`; an address belonging to another seeded user (`cabin-crew@example.com`) → `409`; a malformed address → `400` with the `violations` map; the Google-only seed user → `409`; unauthenticated → `401`.
- [ ] 11.4 Token rejections using the seeded fixtures: expired → `400`; consumed → `400`; unknown → `400`; the collision fixture → `409` with the account's address unchanged; the valid seeded token confirmed twice → second call `400`.
- [ ] 11.5 Re-send suppression: two consecutive requests for the same new address both return `202` and exactly one confirmation email file exists.
- [ ] 11.6 Session revocation: sign in as the target user, complete a change for that user, then `POST /api/v1/auth/refresh` with the pre-change refresh token returns `401`.
- [ ] 11.7 The confirm endpoint behaves identically with and without a bearer token.

## 12. Documentation

- [ ] 12.1 Add the two endpoints and the pending-address semantics to `README.md`, next to the password-reset documentation.
- [ ] 12.2 Add one sentence to the README's Google Sign-In section explaining that a mutable email is why `POST /api/v1/auth/google` must keep resolving by `googleId` only.

## 13. Verify

- [ ] 13.1 `docker compose exec app npm run lint` and `npm run build` pass.
- [ ] 13.2 `docker compose exec app npm test -- email-change-mail.listener` passes.
- [ ] 13.3 `docker compose exec app npx cucumber-js features/auth/auth.email-change.feature` passes.
- [ ] 13.4 The full `features/auth` and `features/user` suites still pass.
