## Context

The API has no outbound email of any kind. The closest existing thing is the
Discord provider (`src/core/provider/discord/`), whose shape is the template this
change follows: a client class holding the real HTTP call, a `TestDiscordClient`
subclass overriding the send to write a file under `test-data/`, and a
`DiscordClientProvider` factory that picks between them on
`NODE_ENV === 'production'`. The functional suite then asserts against those files
(`features/_context/discord.context.ts`). Every provider HTTP call goes through
`src/core/provider/http/fetch-with-retry.ts`.

There is no `@nestjs/throttler` in the dependency tree, so there is no rate-limiting
primitive available for an unauthenticated endpoint.

Relevant existing pieces: `user.password` is nullable (Google-only accounts have
`null`); `UsersRepository.setPassword` comes from the password-change change;
sessions are rows in `JwtRefreshToken` and `SessionService.closeAllForUser` already
revokes all of them; domain events are plain classes extending `DomainEvent`,
emitted through the global `DomainEventEmitter` and consumed by `@OnEvent`
listeners under a module's `application/event/{internal,external}/`.

## Goals / Non-Goals

**Goals:**

- Account recovery that requires only control of the registered email address.
- An email capability that other features (email change, and whatever comes later)
  can reuse without knowing the vendor.
- No account enumeration through the reset endpoint.
- Tokens that are useless to anyone reading the database.

**Non-Goals:**

- HTML email, templating engines, localisation, or per-user email preferences —
  plain text only for now.
- Delivery tracking, bounce handling, or Mailgun webhooks.
- General-purpose IP rate limiting / a global throttler (see risks).
- A UI for the reset form. The email links to `FRONTEND_BASE_URL`; the frontend
  collects the new password and calls the confirm endpoint.
- Email verification at sign-up. Only _changing_ an email gets confirmed, and that
  is a separate change.

## Decisions

**1. One `UserToken` table with a `type` discriminator, not a table per flow.**

```prisma
enum UserTokenType {
  password_reset
}

model UserToken {
  id         String        @id @default(uuid()) @db.Uuid
  userId     String        @db.Uuid
  type       UserTokenType
  tokenHash  String        @unique
  createdAt  DateTime      @default(now())
  expiresAt  DateTime
  consumedAt DateTime?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, type])
  @@map("user_token")
}
```

The email-change change is queued immediately behind this one and needs exactly the
same lifecycle (issue → email → single use → expiry), differing only in what
happens on consumption and in one extra field. A shared table with an enum keeps
that to one added enum value and one nullable column.
_Alternative considered:_ a dedicated `PasswordResetToken` table, generalising
later. Rejected — the second flow is known now, not speculative, and two nearly
identical tables would duplicate the expiry/consumption logic.

**2. Random token, SHA-256 at rest — deliberately not bcrypt.** The raw token is 32
bytes from `crypto.randomBytes` rendered `base64url`; the column stores
`sha256(raw)` hex, and confirmation looks the row up by that hash. bcrypt is
unusable here: it is salted per row, so finding the matching row would mean
comparing against every outstanding token. A fast hash is safe _because_ the input
is 256 bits of entropy rather than a human-chosen password — there is no dictionary
to run. Storing the raw token would make a database read equivalent to an account
takeover.

**3. The request endpoint always returns `202 Accepted`, with no body.** The
handler resolves the user, and simply stops — same response — when the address is
unknown, when the account has no password, or when the recent-token guard
suppresses the email. This is the requirement that shapes the whole handler: there
is exactly one exit. `202` (rather than `204`) is honest about the work being
asynchronous.
_Alternative considered:_ `404` for an unknown address. Rejected — it turns the
endpoint into an account-existence oracle.

**4. Google-only accounts get no reset email.** `password === null` means there is
nothing to reset, and setting a password through the reset flow would be a way to
attach password auth to a Google-only account without ever proving control of the
Google identity. That capability belongs to the Google-unlink change, where it is
done from an authenticated session.

**5. Mail is sent from a listener, not from the command handler.** The handler
issues the token then emits `PasswordResetRequestedEvent { userId, email, token }`
via `DomainEventEmitter.emit` (fire-and-forget, not `emitAsync`);
`PasswordResetMailListener` builds the message and calls the client. The HTTP
response therefore never waits on Mailgun, and a Mailgun outage cannot turn a
successful token issue into a `500`. This is also what makes the "identical
response in all cases" requirement cheap to honour.
_Trade-off:_ the raw token travels through an in-process event payload. Acceptable —
it is the same process, and the alternative (the listener re-deriving it) is
impossible by design.

**6. The provider is vendor-named `mailgun`, matching `discord`/`simbrief`/`adsb`.**
`MailgunClient.send(message: MailMessage)` POSTs
`application/x-www-form-urlencoded` (`from`, `to`, `subject`, `text`) to
`${MAILGUN_API_HOST}/v3/${MAILGUN_DOMAIN}/messages` with an `Authorization: Basic`
header built from `api:${MAILGUN_API_KEY}`, via `fetchWithRetry`.
`TestMailgunClient` overrides `send` to write `test-data/mail/<messageType>_<to>.json`.
`MailgunClientProvider` selects on `NODE_ENV === 'production'`, exactly as
`DiscordClientProvider` does. Application code depends on the `MailgunClient`
token, so swapping vendors later is a provider-directory change.
_Alternative considered:_ a `mailgun-mock` mockserver container plus retrieval
assertions in tests. Rejected — the file-writing test client is the pattern already
in the repo for outbound messages, needs no new compose service, and makes the sent
body directly readable by a Cucumber step (which the reset flow needs, to get the
token).

**7. Supersede on issue; suppress re-send for 5 minutes.** Issuing deletes any
outstanding `password_reset` row for the user, so at most one token is live. Before
issuing, the handler checks for an unconsumed, unexpired token created less than
5 minutes ago: if one exists it returns without issuing or emailing. That bounds
mail volume per account to one message per 5 minutes without a throttler
dependency, and it is per-account rather than per-IP, which is the axis that
matters for mail-bombing.
_Alternative considered:_ adding `@nestjs/throttler` globally. Rejected for this
change — a new global request-scoped dependency deserves its own change, and the
per-account guard covers the concrete abuse this endpoint enables.

**8. Confirmation revokes _all_ sessions.** Unlike a password change (where the
acting session just proved it knew the current password), a reset means the account
may be compromised, so `SessionService.closeAllForUser` is the right call. There is
no acting session to preserve — the endpoint is unauthenticated.

**9. One generic `InvalidPasswordResetTokenError extends BadRequestError` (400)**
for unknown, expired, superseded, and already-consumed tokens alike. Distinct
messages would tell an attacker which of their guesses had once been real. `400`
rather than `401`: the caller is not attempting to authenticate, they are submitting
a malformed/stale input to a public endpoint.

**10. Validation runs before the token is consumed.** The confirm handler validates
the new password (the DTO's `@MinLength(8)` in the pipe, so before the handler
runs), resolves and checks the token, sets the password, and only then marks
`consumedAt`. A user whose new password fails validation is not left holding a dead
token and forced to restart the flow.

**11. `FRONTEND_BASE_URL` builds the link.** The email body contains
`${FRONTEND_BASE_URL}/reset-password?token=<raw>`. The API does not serve a reset
form — that path belongs to the frontend, and keeping the base URL in config avoids
hardcoding an environment into an email.

## Risks / Trade-offs

- **[No IP-level rate limiting]** The per-account 5-minute guard does not stop a
  distributed script from probing thousands of _different_ addresses, or from
  issuing requests for the same account every 5 minutes indefinitely. → Mitigated
  in kind (no enumeration signal to harvest, bounded mail per account) rather than
  eliminated; a global throttler is called out as a follow-up.
- **[Fire-and-forget email hides failures from the user]** If Mailgun rejects the
  message the user waits for an email that never arrives, and only the log knows. →
  Accepted: the alternative leaks whether the address was deliverable. The listener
  logs at `error` with the recipient and message type.
- **[Tokens accumulate]** Consumed and expired `UserToken` rows are never cleaned
  up, so the table grows. → Bounded in practice (at most one live row per user per
  type, superseded rows are deleted on issue) and harmless; a scheduled purge can be
  added when the volume justifies a `@Cron`.
- **[Test client writes to a shared directory]** `test-data/mail/` is keyed by
  message type and recipient, so two scenarios resetting the _same_ address in one
  run would overwrite each other's file. → The feature file clears the directory
  between scenarios, as `discord.context.ts` already does with
  "I clear Discord messages directory".
- **[`MAILGUN_API_KEY` in the environment]** A leaked key allows sending mail as the
  domain. → Standard secret handling; `.env.dist` carries a placeholder only, and
  the key is never logged.

## Open Questions

- Which sender address and Mailgun domain production should use. Does not affect the
  specs, the approach, or the tasks — it is a value in the deployment environment.
