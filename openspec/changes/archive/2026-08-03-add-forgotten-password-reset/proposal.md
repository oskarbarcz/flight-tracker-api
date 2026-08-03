## Why

A user who has forgotten their password is locked out permanently. Self-service
rotation requires the current password, and the only other path is an
administrator setting a new password by hand — which both leaks the secret and
does not scale. Recovery has to run through the one channel that proves control of
the account without a password: the user's email address.

This is also the change that gives the API its first outbound email capability. The
system has no mail transport at all today, so there is nothing to send a recovery
link with.

## What Changes

- Add a transactional email capability: a Mailgun-backed client under
  `src/core/provider/mailgun/`, following the same shape as the Discord provider —
  the real HTTP client in production, and a test client that writes each message to
  `test-data/mail/` outside production, selected by a factory provider on
  `NODE_ENV`. Nothing in the application layer talks to Mailgun directly.
- Add a `UserToken` table holding single-use, expiring, hashed tokens with a `type`
  discriminator (`password_reset` for now).
- Add `POST /api/v1/auth/password-reset` (unauthenticated) taking an `email`. It
  always answers `202 Accepted` and never reveals whether the address is known —
  no account enumeration. When the address does belong to an account that has a
  password, a recovery email carrying a one-time link is sent.
- Accounts with no stored password (Google-only) get no recovery email: there is no
  password to reset. The response is the same `202`.
- Add `POST /api/v1/auth/password-reset/confirm` (unauthenticated) taking `token`
  and `newPassword`. On success the password is replaced, the token is consumed so
  it cannot be replayed, **all** of the user's sessions are revoked, and the
  response is `204`.
- Tokens are valid for 1 hour, are single-use, and are superseded: issuing a new
  one invalidates any outstanding token for that user. Only a hash of the token is
  stored; the raw value exists only in the email.
- A repeat request within 5 minutes of a still-valid token does not send another
  email (basic protection against using the endpoint to mail-bomb an address),
  while still answering `202`.

No breaking API changes: two new endpoints, one new table, one new provider.

## Capabilities

### New Capabilities

- `transactional-email`: the system's outbound email delivery — how messages are
  addressed and dispatched, what happens when delivery fails, and how email is
  observable in non-production environments.
- `user-password-reset`: recovery of access to an account whose password is
  unknown, via a one-time link sent to the account's email address.

### Modified Capabilities

- _None._ The `user-password-change` capability is untouched — that endpoint keeps
  requiring the current password.

## Impact

- **New provider `src/core/provider/mailgun/`:** `MailgunClient` (POSTs
  form-encoded messages to `${MAILGUN_API_HOST}/v3/${MAILGUN_DOMAIN}/messages`
  with HTTP Basic `api:${MAILGUN_API_KEY}`, through `fetch-with-retry.ts`),
  `TestMailgunClient` (writes to `test-data/mail/`), `MailgunClientProvider`
  factory, `MailgunModule`, plus a `MailMessage` type.
- **New env keys** in `.env.dist` and README: `MAILGUN_API_HOST`,
  `MAILGUN_DOMAIN`, `MAILGUN_API_KEY`, `MAIL_FROM_ADDRESS`, `FRONTEND_BASE_URL`
  (used to build the link in the email body). No new compose service — the test
  client writes files rather than calling a mock server.
- **Prisma:** new `UserToken` model and `UserTokenType` enum, plus the `userTokens`
  relation on `User`. Requires a migration and `prisma db push` locally.
- **`auth` module:** `UserTokenRepository`; `RequestPasswordResetCommand` and
  `ConfirmPasswordResetCommand` + handlers; two actions, both `@SkipAuth()`; a
  `PasswordResetMailListener` under `application/event/internal/` that reacts to a
  new `PasswordResetRequestedEvent` so the HTTP request does not wait on Mailgun.
  New errors in `model/error/auth.error.ts`.
- **`users` module:** reuses `UsersRepository.setPassword` from the
  password-change work. If that change has not landed, this one adds it.
- **Functional tests:** new `features/auth/auth.password-reset.feature`, plus a new
  `features/_context/mail.context.ts` (assert an email was sent to an address;
  extract the reset token from it) mirroring `discord.context.ts`.
- **Sequencing:** depends on the password-change change only for
  `UsersRepository.setPassword`. The email-change change depends on **this** one for
  the Mailgun provider and the `UserToken` table.
