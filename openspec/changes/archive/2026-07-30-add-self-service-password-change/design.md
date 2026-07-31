## Context

`user.password` is `String?` (nullable) since Google Sign-In landed, and every
credential path must handle null before reaching bcrypt — `findByCredentials`
already returns `null` for a null-password user rather than calling
`bcrypt.compare` with `null`.

The only writer of `user.password` today is `UsersRepository.update`, which hashes
`data.password` in a **second** `prisma.user.update` after the main one. That
method is reached only from the admin `PATCH /api/v1/user/:id`.

Sessions are rows in `JwtRefreshToken`, one per session id, holding a bcrypt hash
of the refresh token. `SessionRepository` can delete one session or all sessions
for a user; the acting session id is in the access token as `session`
(`JwtUser.session`), so a "all except this one" revoke is expressible.

`AuthModule` imports `UsersModule` and consumes the exported `UsersRepository`
directly (`SignInHandler` does exactly this).

## Goals / Non-Goals

**Goals:**

- Self-service password rotation gated on proof of the current password.
- Explicit, narrow repository methods for verifying and setting a password.
- Correct behavior for the three account shapes the Google link-only model
  produces: password-only, password + linked Google, Google-only.

**Non-Goals:**

- Resetting a _forgotten_ password (no current password available) — that is the
  forgotten-password-reset change.
- A functional scenario for the Google-only rejection. Reaching the endpoint needs an
  access token, which a passwordless account can only obtain through Google sign-in,
  which needs an ID token signed by the mock key — and only the public JWKS exists in
  the repo. The guard is unit-tested instead; the Google-only seed user lands with the
  password-reset change, whose flow is unauthenticated. The Google-unlink change will
  have to solve token minting properly.
- Letting a Google-only account set a _first_ password — that is the
  Google-unlink change, which extends this endpoint.
- Retrofitting the 8-character minimum onto user creation or the admin update.
  Doing so would change the contract of endpoints this change does not touch;
  worth doing, separately.
- Password history and breach-list / common-password checks (see decision 11).

## Decisions

**1. The endpoint lives in the `auth` module at `PATCH /api/v1/auth/password`.**
It needs `UsersRepository` _and_ session revocation. `AuthModule` already imports
`UsersModule`, so the auth side can reach both; the reverse (`users` importing
`auth` for `SessionService`) would create a module cycle. Routing it under
`/api/v1/auth` also keeps it in one family with the reset endpoints added next,
and keeps the Swagger `auth` tag honest.
_Alternative considered:_ `PATCH /api/v1/user/me/password` implemented in the auth
module. Rejected — a `/user`-prefixed route declared in `auth` with an `auth`
Swagger tag reads as a mistake to the next person; and the operation is about a
credential, not a profile attribute.

**2. Gate on `password === null`, never on `googleId !== null`.** Google Sign-In
is link-only: an ordinary password user links Google and ends up with both fields
set (the seeded `admin@example.com` is exactly this shape). Gating on `googleId`
would take the password away from the largest group of linked users. `password ===
null` identifies precisely the accounts that have no credential to rotate.
_Alternative considered:_ gating on `googleId`. Rejected as described; recorded
here because the phrase "not possible when Google auth is used" invites the wrong
reading.

**3. `verifyPassword` and `setPassword` on `UsersRepository`, not the wide `update`.**
`verifyPassword(userId, plain): Promise<boolean>` loads the user, returns `false`
when `password === null`, else `bcrypt.compare`. `setPassword(userId, plain)`
hashes with the existing `BCRYPT_SALT_ROUNDS = 12` and writes the single column.
This keeps the credential path off the DTO-shaped `update()` (whose contract is
"apply an admin patch") and gives the reset change a method to reuse.
_Alternative considered:_ calling `update(userId, { password })`. Rejected — it
would run the role/pilot-license guards and a redundant double write on a path
where neither belongs.

**4. `PasswordNotSetError extends ConflictError` (409) for Google-only accounts.**
Not a `400`: the request is well-formed, and not a `401`: the caller is
authenticated. 409 says "this account is not in a state where this operation
applies", matching how the Google-link errors already use `ConflictError`.

**5. A wrong current password is `UnauthorizedError` (401) reusing
`InvalidCredentialsError`.** The failure is a credential check, and the existing
error already carries the deliberately vague `Credentials are incorrect.`
message. Reusing it keeps the response indistinguishable from a failed sign-in.

**6. "New must differ" is enforced in the handler, not by a validator.** The check
needs the stored hash, so it cannot be a `class-validator` rule comparing two body
fields against the database. The handler compares after verification and throws
`NewPasswordMustDifferError extends BadRequestError`. Ordering matters: verify the
current password **first**, so an attacker who guesses wrong learns nothing from a
"must differ" response.

**7. Revoke other sessions, keep the acting one.** `SessionRepository.removeAllSessionsForUserExcept(userId, sessionId)`
(`deleteMany` with `userId` and `id: { not: sessionId }`), exposed as
`SessionService.closeAllForUserExcept`. Signing the user out of the device they
are actively using is a worse experience with no security gain — that device just
proved it holds the current password.
_Alternative considered:_ `closeAllForUser` (full sign-out). Rejected for the
above; the reset flow, where the account may be compromised, does revoke
everything.

**8. `204 No Content`.** There is nothing useful to return: the user is unchanged
except for a hash the API never exposes, and the caller's tokens stay valid.

**9. Refreshing a revoked session had to be fixed from `500` to `401`.** Discovered
while building the revocation test: `JwtTokenGuard` only verifies the JWT's signature
and type — it never checks that the session row exists — so `RefreshTokenHandler`
reached `SessionRepository.update`, a `prisma.jwtRefreshToken.update` on a deleted row,
which raised Prisma `P2025` and surfaced as a `500`. Reproducible today by signing out
and then refreshing, and covered by no test. Since this is the change that makes session
revocation a deliberate feature, "the other session can no longer be refreshed" cannot
be specified while the observable behavior is a server error. `update` now uses
`updateMany` and returns its `count`; `SessionService.renew` throws
`SessionNoLongerValidError extends UnauthorizedError` when the count is `0`.
`updateMany` rather than a read-then-write existence check, so there is no race between
checking and updating.
_Alternative considered:_ having the guard load the session row on every request.
Rejected — it puts a database read in front of every authenticated endpoint to fix a
problem that only exists on one, and would change the meaning of access-token
validation.

**10. The "other session" is a seeded fixture, not a second live sign-in.**
`apiTokens` in `features/_context/rest-api.context.ts` is keyed by role and each
sign-in overwrites that key, so one user cannot hold two tokens. Rather than add
state-carrying scaffolding to the context, `prisma/seed/resource/session.seed.ts`
seeds one `JwtRefreshToken` row for the operations user: a long-lived ES256 refresh
token signed with the repo's `JWT_PRIVATE_KEY`, hardcoded in the feature file exactly
as the Google features hardcode their ID tokens, with its bcrypt hash in the seed. One
generic step — `I send a {string} request to {string} with bearer token {string}` —
sends an explicit token; it carries no state between steps.
_Alternative considered:_ a step that remembers a second session's token from a
sign-in response. Rejected as the context workaround the project has ruled out.

**11. The new password must be strong, and only the new one.** `newPassword` carries
`@IsStrongPassword({ minLength: 12, minLowercase: 1, minUppercase: 1, minNumbers: 1,
minSymbols: 1 })` from `class-validator` 0.14, with one custom message stating the whole
policy — the built-in `is not strong enough` tells a user nothing about what to fix, and
emitting one violation per failed class would enumerate the policy piecemeal across
several requests. `currentPassword` keeps only `@IsNotEmpty() @IsString()`: it is checked
against the stored hash, not against policy, so a user whose password predates the rule
can still rotate it. That asymmetry is what makes the policy adoptable without a
migration.
_Consequence worth noting:_ with a weak stored password, the handler's
"new must differ" branch is unreachable through the DTO — an identical new password now
fails strength validation first. The functional scenario therefore changes the password
to a compliant value, then submits that same value again, which is the only state where
current and new can both be strong and equal.

## Risks / Trade-offs

- **[The strength policy applies only here]** User creation and the admin update still
  accept anything non-empty, so the policy is inconsistent across endpoints — and the
  seeded `P@$$w0rd` would **not** pass it. → Deliberate: retrofitting it onto
  `POST /api/v1/user` would change an endpoint this change does not own and would
  invalidate every seed fixture and sign-in step in the suite. Worth doing as its own
  change, together with the reset flow (which reuses this policy for the password it
  sets).
- **[Composition rules are not what current guidance recommends]** NIST SP 800-63B
  argues for length plus a breached-password blocklist and _against_ mandated character
  classes, which push users toward predictable substitutions (`P@ssw0rd1!`). → The
  policy here is the conventional, immediately-available control; a blocklist is the
  higher-value follow-up and is recorded as a non-goal rather than dismissed.
- **[Stale access tokens on other devices]** Revoking refresh tokens does not
  invalidate access tokens already issued, so another device keeps API access for
  up to the 15-minute access-token lifetime. → Accepted: this is the existing
  property of the sign-out-everywhere flow, not something this change introduces.
- **[bcrypt cost on a user-facing request]** The handler performs one `compare`
  and one `hash` at cost 12, so the request is deliberately slow (~hundreds of
  ms). → Acceptable for a rare operation, and the cost is what makes the stored
  hashes worth anything.
