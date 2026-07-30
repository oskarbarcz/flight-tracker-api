## Why

There is no way for a signed-in user to rotate their own password. The only path
that writes `user.password` is the admin-only `PATCH /api/v1/user/:id`, which
means a user who suspects their password is compromised must ask an administrator
to set a new one — and that administrator necessarily learns it. Password rotation
must be self-service and must require proof of the current password.

## What Changes

- Add `PATCH /api/v1/auth/password` — an authenticated user submits
  `currentPassword` and `newPassword`; on success the stored hash is replaced and
  the response is `204`.
- The current password is verified before the change. A wrong `currentPassword` is
  rejected as unauthorized, with the same message regardless of which part failed.
- Accounts that sign in **only** with Google have no password to verify
  (`user.password` is null) and are rejected with a conflict. Note this gates on
  *the absence of a password*, not on the presence of a linked Google account: the
  link-only Google flow means an ordinary password user may also have a `googleId`,
  and such a user keeps full control of their password.
- The new password must differ from the current one and must be at least 8
  characters.
- All of the user's **other** sessions are revoked on success; the session that
  performed the change stays valid, so the caller is not signed out of the device
  they are using.

No breaking API changes: this is one new endpoint.

## Capabilities

### New Capabilities

- `user-password-change`: an authenticated user rotates their own password by
  proving knowledge of the current one.

### Modified Capabilities

- _None._

## Impact

- **`auth` module** (not `users`): the endpoint needs both `UsersRepository`
  (exported by `UsersModule`, already imported by `AuthModule`) and
  `SessionRepository`/`SessionService`. Putting it in `users` would require
  `users` to depend on `auth`, which already depends on `users` — a cycle. New
  `ChangePasswordCommand` + handler, `ChangePasswordAction`
  (`PATCH /api/v1/auth/password`), `ChangePasswordDto`, and new errors in
  `model/error/auth.error.ts`.
- **`users` module:** `UsersRepository` gains `verifyPassword(userId, plain)` and
  `setPassword(userId, plain)` so the credential check and the hash write are
  explicit, instead of routing a password through the wide `update()` path.
- **`auth` module:** `SessionRepository` gains
  `removeAllSessionsForUserExcept(userId, sessionId)`, surfaced through
  `SessionService.closeAllForUserExcept`.
- **No schema/migration change.**
- **Functional tests:** new `features/auth/auth.password-change.feature`.
- **Sequencing:** independent of the profile-update change. The forgotten-password
  reset change reuses `setPassword`; the Google-unlink change extends this
  endpoint so a Google-only account can set a first password.
