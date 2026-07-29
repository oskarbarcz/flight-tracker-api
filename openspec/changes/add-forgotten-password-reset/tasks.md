## 1. Mailgun provider

- [ ] 1.1 Add `src/core/provider/mailgun/types/mail.types.ts` with `MailMessage = { to: string; subject: string; text: string; type: MailMessageType }` and a `MailMessageType` union/enum whose first member is the password-reset message.
- [ ] 1.2 Add `src/core/provider/mailgun/client/mailgun.client.ts` with `MailgunClient` (constructor takes host, domain, api key and sender address; `send(message)` POSTs `application/x-www-form-urlencoded` `from`/`to`/`subject`/`text` to `${host}/v3/${domain}/messages` with `Authorization: Basic base64("api:" + key)` through `fetchWithRetry`; throws on a non-ok response; logs the recipient and message type but never the body).
- [ ] 1.3 In the same file add `TestMailgunClient extends MailgunClient` overriding `send` to write `test-data/mail/${type}_${to}.json` (recipient, subject, text) with `fs.mkdir(..., { recursive: true })`, mirroring `TestDiscordClient`.
- [ ] 1.4 Add `MailgunClientProvider` — a factory keyed on `ConfigService.get('NODE_ENV') === 'production'` choosing between the two clients — and `MailgunModule` exporting `MailgunClient`, mirroring `DiscordClientProvider`/`discord.module.ts`.
- [ ] 1.5 Add a colocated `mailgun.client.spec.ts`: the real client builds the expected URL, Basic auth header and form body (stubbed `fetch`), throws on a non-ok response, and the test client writes the expected file.

## 2. Configuration

- [ ] 2.1 Add `MAILGUN_API_HOST`, `MAILGUN_DOMAIN`, `MAILGUN_API_KEY`, `MAIL_FROM_ADDRESS`, `FRONTEND_BASE_URL` to `.env.dist` with development placeholders, and to the local `.env`.
- [ ] 2.2 Document the five keys and the "email is written to `test-data/mail/` outside production" behavior in `README.md`, in a section alongside the Google Sign-In one.

## 3. Prisma schema

- [ ] 3.1 Add the `UserTokenType` enum (`password_reset`) and the `UserToken` model to `prisma/schema.prisma` per design decision 1, plus the `userTokens UserToken[]` relation on `User`.
- [ ] 3.2 Create the migration and apply it; run `docker compose exec app npx prisma db push` locally and `npx prisma generate` (client output is `prisma/client/`).

## 4. Token repository

- [ ] 4.1 Add `src/modules/auth/infra/database/repository/user-token.repository.ts` with `issue(userId, type, ttlMs): Promise<string>` (generate 32 random bytes as `base64url`, delete outstanding rows of that type for the user, insert the `sha256` hex hash with `expiresAt`, return the **raw** token), `findValid(type, rawToken)` (look up by hash; return null when missing, consumed, or expired), `findRecentUnconsumed(userId, type, withinMs)`, and `consume(id)` (set `consumedAt`).
- [ ] 4.2 Keep the hashing helper (`sha256`) private to the repository so no other layer sees raw-vs-hashed token handling.

## 5. Domain event and mail listener

- [ ] 5.1 Add `src/core/domain/events/dto/user-credentials.events.ts` with a `UserCredentialsEventType` enum and `PasswordResetRequestedEvent extends DomainEvent` carrying `{ userId, email, token }`.
- [ ] 5.2 Add `src/modules/auth/application/event/internal/password-reset-mail.listener.ts`: `@OnEvent(UserCredentialsEventType.PasswordResetRequested)` builds the message (subject + body containing `${FRONTEND_BASE_URL}/reset-password?token=<raw>` and the 1-hour validity) and calls `MailgunClient.send`, catching and logging any failure so it cannot propagate.
- [ ] 5.3 Add a colocated `password-reset-mail.listener.spec.ts`: the listener sends a message whose text contains the token and configured base URL, and swallows a client rejection.

## 6. Errors and DTOs

- [ ] 6.1 Add `InvalidPasswordResetTokenError extends BadRequestError` to `src/modules/auth/model/error/auth.error.ts`, with one generic message covering unknown/expired/superseded/consumed.
- [ ] 6.2 Add `RequestPasswordResetDto` (`email`: `@IsEmail() @IsNotEmpty()`) and `ConfirmPasswordResetDto` (`token`: `@IsString() @IsNotEmpty()`; `newPassword`: `@IsString() @IsNotEmpty() @MinLength(8)`) under `src/modules/auth/infra/http/request/`.

## 7. Commands

- [ ] 7.1 Add `RequestPasswordResetCommand(email)` + handler: resolve the user by email; return silently when there is no user, when `password === null`, or when `findRecentUnconsumed(userId, password_reset, 5 min)` returns a row; otherwise `issue(...)` with a 1-hour TTL and emit `PasswordResetRequestedEvent`. Exactly one exit path — the handler returns `void` in every case.
- [ ] 7.2 Add `ConfirmPasswordResetCommand(token, newPassword)` + handler: `findValid` or throw `InvalidPasswordResetTokenError`; `UsersRepository.setPassword`; `consume(tokenId)`; `SessionService.closeAllForUser(userId)` — in that order, so a failed password write leaves the token usable.
- [ ] 7.3 If the password-change change has not landed yet, add `UsersRepository.setPassword` here (hash with `BCRYPT_SALT_ROUNDS`, update only the `password` column).

## 8. HTTP actions

- [ ] 8.1 Add `RequestPasswordResetAction`: `@Controller('/api/v1/auth')`, `@Post('password-reset')`, `@SkipAuth()`, `@HttpCode(HttpStatus.ACCEPTED)`, no body in the response; Swagger `@ApiTags('auth')`, `@ApiAcceptedResponse()`, `@ApiBadRequestResponse({ type: GenericBadRequestResponse<RequestPasswordResetDto> })` and an `@ApiOperation` description stating that the response is identical whether or not the address is known.
- [ ] 8.2 Add `ConfirmPasswordResetAction`: `@Post('password-reset/confirm')`, `@SkipAuth()`, `@HttpCode(HttpStatus.NO_CONTENT)`; Swagger with `@ApiNoContentResponse()` and `@ApiBadRequestResponse`.

## 9. Module wiring

- [ ] 9.1 Register both handlers, the listener and `UserTokenRepository` in `providers`, both actions in `controllers`, and `MailgunModule` in `imports` of `auth.module.ts`.

## 10. Seed data

- [ ] 10.1 Add a `loadUserTokens` resource seed (`prisma/seed/resource/user-token.seed.ts`) wired into `loadResources()`, with fixed v4 ids and precomputed SHA-256 hashes for three fixtures on distinct users: a valid unexpired `password_reset` token, an expired one, and an already-consumed one. Record each raw token as a literal in the seed so the feature file can submit it.
- [ ] 10.2 Ensure the Google-only seed user exists (added by the password-change change; add it here if that change has not landed) for the "no email for a passwordless account" scenario.

## 11. Test context

- [ ] 11.1 Add `features/_context/mail.context.ts` mirroring `discord.context.ts`: `Then I see an email to {string} with subject containing {string}`, `Then no email was sent to {string}`, `Then I clear sent emails directory`, and a step that extracts the reset token from the email to an address and uses it in the next request (read `test-data/mail/*_<address>.json`, match the token out of the link).

## 12. Functional tests

- [ ] 12.1 Add `features/auth/auth.password-reset.feature`. Happy path: clear the mail directory, `POST /api/v1/auth/password-reset` for `operations@example.com` returns `202`; an email to that address is asserted; the token is extracted and `POST /api/v1/auth/password-reset/confirm` with a new password returns `204`; sign-in with the new password returns `200` and with `P@$$w0rd` returns `401`; reset the database at the end.
- [ ] 12.2 Non-enumeration: a request for `nobody@example.com` returns `202` with an identical (empty) body, and no email file is written; a request for the Google-only seed user returns `202` and writes no email.
- [ ] 12.3 Token rejections, using the seeded fixtures so no lifecycle driving is needed: expired token `400`, consumed token `400`, unknown token `400`, and a superseded token (request twice after letting the 5-minute window lapse is not testable in-suite — instead confirm the seeded valid token, then submit it again for `400`).
- [ ] 12.4 Re-send suppression: two consecutive `POST /api/v1/auth/password-reset` calls for the same address both return `202` and exactly one email file exists.
- [ ] 12.5 Validation: a non-email `email` returns `400` with the `violations` map; a `newPassword` shorter than 8 characters returns `400` and the seeded valid token is still accepted afterwards (proving 7.2's ordering).
- [ ] 12.6 Session revocation: sign in as the target user, complete a reset for that user, then `POST /api/v1/auth/refresh` with the pre-reset refresh token returns `401`.
- [ ] 12.7 Both endpoints are reachable without a token (they are `@SkipAuth()`), and sending a valid bearer token does not change their behavior.

## 13. Verify

- [ ] 13.1 `docker compose exec app npm run lint` and `npm run build` pass.
- [ ] 13.2 `docker compose exec app npm test -- mailgun.client password-reset-mail.listener` passes.
- [ ] 13.3 `docker compose exec app npx cucumber-js features/auth/auth.password-reset.feature` passes.
- [ ] 13.4 The full `features/auth` and `features/user` suites still pass (seed additions).
