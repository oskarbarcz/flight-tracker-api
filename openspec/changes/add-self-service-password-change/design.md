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

- Resetting a *forgotten* password (no current password available) — that is the
  forgotten-password-reset change.
- Letting a Google-only account set a *first* password — that is the
  Google-unlink change, which extends this endpoint.
- Retrofitting the 8-character minimum onto user creation or the admin update.
  Doing so would change the contract of endpoints this change does not touch;
  worth doing, separately.
- Password history, complexity classes, or breach-list checks.

## Decisions

**1. The endpoint lives in the `auth` module at `PATCH /api/v1/auth/password`.**
It needs `UsersRepository` *and* session revocation. `AuthModule` already imports
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

## Risks / Trade-offs

- **[8-character minimum applies only here]** User creation still accepts shorter
  passwords, so the policy is inconsistent across endpoints. → Accepted and
  documented as a non-goal; the seeded `P@$$w0rd` satisfies the new rule, so a
  later retrofit will not invalidate fixtures.
- **[Stale access tokens on other devices]** Revoking refresh tokens does not
  invalidate access tokens already issued, so another device keeps API access for
  up to the 15-minute access-token lifetime. → Accepted: this is the existing
  property of the sign-out-everywhere flow, not something this change introduces.
- **[bcrypt cost on a user-facing request]** The handler performs one `compare`
  and one `hash` at cost 12, so the request is deliberately slow (~hundreds of
  ms). → Acceptable for a rare operation, and the cost is what makes the stored
  hashes worth anything.
