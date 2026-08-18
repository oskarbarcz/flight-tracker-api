## Why

The credential self-service work deliberately locks out accounts that have no
stored password: a Google-only user cannot change a password, reset one, or change
their email, because every one of those operations needs a password to verify. That
is the right gate, but it currently has no exit. A user who signed up through Google
is permanently unable to take local control of their account, and if they ever lose
access to the Google identity — a closed work account, a revoked OAuth client — the
account is unrecoverable, since password reset does nothing for them by design.

Linking is also one-way today: `POST /api/v1/user/me/link-google-account` sets `googleId` and
nothing ever clears it. A user who linked the wrong Google account cannot correct it.

## What Changes

- Add `POST /api/v1/user/me/set-password` — an authenticated user whose account has **no**
  password sets one for the first time. Authorisation is the access token itself,
  which for a Google-only user was obtained by proving control of the Google
  identity. Rejected with a conflict if the account already has a password; rotating
  an existing password stays with `PATCH /api/v1/user/me/change-password`.
- Add `POST /api/v1/user/me/unlink-google-account` — an authenticated user, on submitting their
  current password, clears the Google link. Afterwards Google sign-in for that
  account is rejected and email/password sign-in is the only route in.
- Unlinking is refused with a conflict when the account has no password, since that
  would leave it with no way to sign in at all. Setting a password first is the
  required order, and the two endpoints together are the documented escape hatch out
  of Google-only.
- Unlinking is refused with a conflict when no Google account is linked.
- After unlinking, `POST /api/v1/user/me/link-google-account` works again, so a user can move
  the account to a different Google identity.
- Sessions are unaffected by unlinking; setting a first password revokes the user's
  other sessions, as a password change does.

No breaking API changes: two new endpoints.

## Capabilities

### New Capabilities

- `user-password-setup`: establishing a password on an account that has none —
  distinct from rotating a password that is already known.
- `google-account-unlink`: removing the Google identity link from an account,
  including the safeguards that stop a user locking themselves out.

### Modified Capabilities

- _None._ `user-password-change` keeps its exact contract: `PATCH /api/v1/user/me/change-password`
  still requires a current password and still rejects accounts that have none. This
  change adds a sibling endpoint rather than relaxing that one.

## Impact

- **Depends on `add-self-service-password-change`** for `UsersRepository.verifyPassword`,
  `UsersRepository.setPassword` and the other-session sign-out used after a password change.
- **`users` module:** `SetPasswordCommand` + handler, `SetPasswordAction`
  (`POST /api/v1/user/me/set-password`) and `SetPasswordDto`; `UsersRepository` gains
  `hasPassword`, `hasLinkedGoogleAccount` and `unlinkGoogleAccount`, the counterpart of the
  existing `linkGoogleAccount`; new errors `PasswordAlreadySetError`,
  `CannotUnlinkWithoutPasswordError` and `UserHasNoLinkedGoogleAccountError`.
- **`auth` module:** `UnlinkGoogleAccountCommand` + handler, `UnlinkGoogleAccountAction`
  (`POST /api/v1/user/me/unlink-google-account`) and `UnlinkGoogleAccountDto`, next to the
  existing link action.
- **No schema/migration change** — `googleId` is already nullable.
- **Functional tests:** `features/user/user.set-password.feature` covering the Google-only
  escape journey and `features/user/user.unlink-google-account.feature` covering the unlink,
  including that an unlinked account can no longer sign in with its Google ID token. Both
  need new fixtures: a second JWKS key and ID token in the Google mock, and seeded refresh
  sessions for the revocation scenarios.
- **`README.md`:** the Google Sign-In section states that the flow is link-only;
  it gains the unlink endpoint and the "set a password first" ordering rule.
