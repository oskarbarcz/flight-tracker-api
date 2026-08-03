## 1. Mailgun provider

- [x] 1.1 Add `src/core/provider/mailgun/types/mail.types.ts` with `MailMessage = { to: string; subject: string; text: string; type: MailMessageType }` and a `MailMessageType` union/enum whose first member is the password-reset message.
- [x] 1.2 Add `src/core/provider/mailgun/client/mailgun.client.ts` with `MailgunClient` (constructor takes host, domain, api key and sender address; `send(message)` POSTs `application/x-www-form-urlencoded` `from`/`to`/`subject`/`text` to `${host}/v3/${domain}/messages` with `Authorization: Basic base64("api:" + key)` through `fetchWithRetry`; throws on a non-ok response; logs the recipient and message type but never the body).
- [x] 1.3 In the same file add `TestMailgunClient extends MailgunClient` overriding `send` to write the message (recipient, subject, text) with `fs.mkdir(..., { recursive: true })`, mirroring `TestDiscordClient`. **Deviation:** the filename is `${type}_${to}_${uuid}.json`, not `${type}_${to}.json` — a fixed name lets a second send overwrite the first, which would make the re-send-suppression assertion (12.4) unable to fail.
- [x] 1.4 Add `MailgunClientProvider` — a factory keyed on `ConfigService.get('NODE_ENV') === 'production'` choosing between the two clients — and `MailgunModule` exporting `MailgunClient`, mirroring `DiscordClientProvider`/`discord.module.ts`.
- [x] 1.5 Add a colocated `mailgun.client.spec.ts`: the real client builds the expected URL, Basic auth header and form body (stubbed `fetch`), throws on a non-ok response, and the test client writes the expected file.

## 2. Configuration

- [x] 2.1 Add `MAILGUN_API_HOST`, `MAILGUN_DOMAIN`, `MAILGUN_API_KEY`, `MAIL_FROM_ADDRESS`, `FRONTEND_BASE_URL` to `.env.dist` with development placeholders, and to the local `.env`.
- [x] 2.2 Document the five keys and the "email is written to `test-data/mail/` outside production" behavior in `README.md`, in a section alongside the Google Sign-In one.

## 3. Prisma schema

- [x] 3.1 Add the `UserTokenType` enum (`password_reset`) and the `UserToken` model to `prisma/schema.prisma` per design decision 1, plus the relation on `User`. **Note:** the table arrived with `add-self-service-email-change` (built out of order); this change adds the `password_reset` enum value. The relation field is named `tokens`, and `tokenHash` is unique per `(type, tokenHash)` rather than globally.
- [x] 3.2 Create the migration and apply it; run `docker compose exec app npx prisma db push` locally and `npx prisma generate` (client output is `prisma/client/`).

## 4. Token repository

- [x] 4.1 Add `src/modules/auth/infra/database/repository/user-token.repository.ts` with `issue(userId, type, ttlMs)` (generate 32 random bytes as `base64url`, delete outstanding rows of that type for the user, insert the `sha256` hex hash with `expiresAt`, return the **raw** token — as `{ id, rawToken }`), `findValid(type, rawToken)` (look up by hash; return null when missing, consumed, or expired), `findRecentUnconsumed(userId, type, withinMs)`, and `consume(id)` (set `consumedAt`). Built by `add-self-service-email-change`; `issue` already takes the optional `newEmail` payload.
- [x] 4.2 Keep the hashing helper (`sha256`) out of every other layer. **Deviation:** `hashUserToken` is exported rather than private, because the seed fixtures need to derive hashes from the raw tokens they record. No application-layer code imports it.

## 5. Domain event and mail listener

- [x] 5.1 Add `src/core/domain/events/dto/user-credentials.events.ts` with a `UserCredentialsEventType` enum and `PasswordResetRequestedEvent extends DomainEvent` carrying `{ userId, email, token }`.
- [x] 5.2 Add `src/modules/auth/application/event/internal/password-reset-mail.listener.ts`: `@OnEvent(UserCredentialsEventType.PasswordResetRequested)` builds the message (subject + body containing `${FRONTEND_BASE_URL}/reset-password?token=<raw>` and the 1-hour validity) and calls `MailgunClient.send`, catching and logging any failure so it cannot propagate.
- [x] 5.3 Add a colocated `password-reset-mail.listener.spec.ts`: the listener sends a message whose text contains the token and configured base URL, and swallows a client rejection.

## 6. Errors and DTOs

- [x] 6.1 Add `InvalidPasswordResetTokenError extends BadRequestError` to `src/modules/auth/model/error/auth.error.ts`, with one generic message covering unknown/expired/superseded/consumed.
- [x] 6.2 Add `RequestPasswordResetDto` (`email`: `@IsEmail() @IsNotEmpty()`) and `ConfirmPasswordResetDto` (`token`: `@IsString() @IsNotEmpty()`; `newPassword`) under `src/modules/auth/infra/http/request/`. **Deviation:** `newPassword` uses the same `@IsStrongPassword` rule and message as `ChangePasswordDto` instead of `@MinLength(8)` — that rule landed with the password-change change after this one was written, and a reset must not be a way around the password policy.

## 7. Commands

- [x] 7.1 Add `RequestPasswordResetCommand(email)` + handler: resolve the user by email; return silently when there is no user, when `password === null`, or when `findRecentUnconsumed(userId, password_reset, 5 min)` returns a row; otherwise `issue(...)` with a 1-hour TTL and emit `PasswordResetRequestedEvent`. Exactly one exit path — the handler returns `void` in every case.
- [x] 7.2 Add `ConfirmPasswordResetCommand(token, newPassword)` + handler: `findValid` or throw `InvalidPasswordResetTokenError`; `UsersRepository.setPassword`; `consume(tokenId)`; `SessionService.closeAllForUser(userId)` — in that order, so a failed password write leaves the token usable.
- [x] 7.3 ~~If the password-change change has not landed yet, add `UsersRepository.setPassword` here~~ — it had landed; `setPassword` was reused as-is. `UsersRepository.findByEmail` was added here, since resolving a user by address had no public repository method.

## 8. HTTP actions

- [x] 8.1 Add `RequestPasswordResetAction`: `@Controller('/api/v1/auth')`, `@Post('password-reset')`, `@SkipAuth()`, `@HttpCode(HttpStatus.ACCEPTED)`, no body in the response; Swagger `@ApiTags('auth')`, `@ApiAcceptedResponse()`, `@ApiBadRequestResponse({ type: GenericBadRequestResponse<RequestPasswordResetDto> })` and an `@ApiOperation` description stating that the response is identical whether or not the address is known.
- [x] 8.2 Add `ConfirmPasswordResetAction`: `@Post('password-reset/confirm')`, `@SkipAuth()`, `@HttpCode(HttpStatus.NO_CONTENT)`; Swagger with `@ApiNoContentResponse()` and `@ApiBadRequestResponse`.

## 9. Module wiring

- [x] 9.1 Register both handlers, the listener and `UserTokenRepository` in `providers`, both actions in `controllers`, and `MailgunModule` in `imports` of `auth.module.ts`.

## 10. Seed data

- [x] 10.1 Add three `password_reset` fixtures to `prisma/seed/resource/user-token.seed.ts` on distinct users — valid (Abby Doe), expired (Alan Doe), consumed (Michael Doe) — with fixed v4 ids and the raw token recorded as a literal. Hashes are derived at seed time via `hashUserToken` rather than pasted, so a fixture can never drift from its raw token.
- [x] 10.2 The Google-only seed user did **not** exist (the password-change change never added one), so it was added here: **Grace Doe** (`grace.doe@example.com`, `password: null`, `googleId` set). `features/user/user.list.feature` was updated for the extra row — it sorts by nothing, so the new row lands between Emma and Rick in heap order.

## 11. Test context

- [x] 11.1 Add `features/_context/mail.context.ts` (built by `add-self-service-email-change`, extended here): `I clear sent emails directory`, `I see {int} email(s) sent to {string}`, `I see an email to {string} with subject {string}`, `I see an email to {string} containing {string}`, `I see no email to {string} containing {string}`, and request steps that take the token out of the link sent to an address (with an optional extra body, which the reset confirm needs for `newPassword`). Because mail is sent fire-and-forget after the response, every read polls until its expectation holds; absence assertions wait out a fixed settle window. The token step reuses `sendApiRequest` exported from `rest-api.context.ts`, so response assertions stay in one place.

## 12. Functional tests

- [x] 12.1 Add `features/auth/auth.password-reset.feature`. Happy path: clear the mail directory, `POST /api/v1/auth/password-reset` for `operations@example.com` returns `202`; an email to that address is asserted; the token is extracted and `POST /api/v1/auth/password-reset/confirm` with a new password returns `204`; sign-in with the new password returns `200` and with `P@$$w0rd` returns `401`; reset the database at the end.
- [x] 12.2 Non-enumeration: a request for `nobody@example.com` returns `202` with an identical (empty) body, and no email file is written; a request for the Google-only seed user returns `202` and writes no email.
- [x] 12.3 Token rejections, using the seeded fixtures so no lifecycle driving is needed: expired token `400`, consumed token `400`, unknown token `400`, the seeded valid token confirmed twice → second call `400`, and supersession made directly testable — a fresh request for Abby Doe invalidates her seeded token, which then returns `400` with her password unchanged.
- [x] 12.4 Re-send suppression: two consecutive `POST /api/v1/auth/password-reset` calls for the same address both return `202` and exactly one email file exists.
- [x] 12.5 Validation: a non-email `email` returns `400` with the `violations` map; a `newPassword` shorter than 8 characters returns `400` and the seeded valid token is still accepted afterwards (proving 7.2's ordering).
- [x] 12.6 Session revocation: sign in as the target user, complete a reset for that user, then `POST /api/v1/auth/refresh` with the pre-reset refresh token returns `401`.
- [x] 12.7 Both endpoints are reachable without a token (they are `@SkipAuth()`), and sending a valid bearer token does not change their behavior — one unauthorized scenario covering request + confirm, plus an admin and a cabin-crew scenario doing the same with a bearer present.

## 13. Verify

- [x] 13.1 `docker compose exec app npm run lint` and `npm run build` pass.
- [x] 13.2 `docker compose exec app npm test` passes — 23 suites / 121 tests, including `mailgun.client`, `password-reset-mail.listener` and both reset command handlers.
- [x] 13.3 `docker compose exec app npx cucumber-js features/auth/auth.password-reset.feature` passes — 15 scenarios.
- [x] 13.4 `features/auth` + `features/user` pass (150 scenarios), and the full functional suite passes (901 scenarios / 4226 steps).
