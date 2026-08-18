## Context

Google Sign-In is link-only (`README.md § Google Sign-In`): `POST /api/v1/user/me/link-google-account`
stores Google's `sub` on the signed-in user, and `POST /api/v1/auth/google` exchanges a
Google ID token for the app's own JWT pair by resolving `googleId` — never email.
`UsersRepository.linkGoogleAccount` refuses to link when `googleId` is already set or
when the Google account belongs to another user, and nothing anywhere clears `googleId`.

`user.password` is nullable, and the three preceding changes all gate on
`password === null`: password change, password reset, and email change each refuse an
account with no password. That is deliberate — none of them can verify anything — but
it means a Google-only account has no route to local credentials.

`googleId` is already `String? @unique`, so nothing about this change needs a
migration.

## Goals / Non-Goals

**Goals:**

- A supported path from "Google-only account" to "account with a password", so the
  gates in the preceding changes are a state to leave rather than a dead end.
- Unlink that cannot strand a user without a credential.
- Correct interaction with the existing link endpoint: unlink then relink works.

**Non-Goals:**

- Relaxing `PATCH /api/v1/user/me/change-password`. It keeps requiring a current password.
- Multiple linked identities, or any second OAuth provider.
- Verifying the account's email address as part of setting a first password. The
  address came from Google's verified claim on sign-up, and email verification in
  general is out of scope here.
- A "remove my account" flow.

## Decisions

**1. Setting a first password is a separate `POST /api/v1/user/me/set-password`, not a relaxed
`PATCH`.** The obvious alternative was to make `currentPassword` optional on the
existing endpoint and branch in the handler. Rejected: it turns a strictly validated
DTO into a conditionally validated one, so the pipe can no longer reject a missing
current password and every future reader has to reconstruct which combinations are
legal. `POST` creates the credential (409 if one exists), `PATCH` modifies it (409 if
none exists) — the two endpoints are exhaustive, mutually exclusive, and each keeps a
DTO whose fields are unconditionally required.

**2. The access token is sufficient authorisation for a first password.** A Google-only
user's token was minted by `POST /api/v1/auth/google` after `GoogleIdentityClient`
verified a Google-signed ID token, so the caller has already proven control of the
linked identity. Demanding a second factor they do not possess would make the endpoint
unusable, which is the whole problem being solved.
_Alternative considered:_ requiring a fresh Google ID token in the request body.
Rejected as redundant — the access token is downstream of exactly that proof — and it
would push Google-token verification into a `users`-shaped operation.

**3. Unlink is `POST /api/v1/user/me/unlink-google-account`, not `DELETE .../link-google-account`.** The operation
takes a `currentPassword` in the body, and a `DELETE` carrying a request body is
awkward for clients and proxies alike. `POST .../unlink` is also the mirror of the
existing `POST .../link`, so the pair reads consistently in Swagger.
_Alternative considered:_ `DELETE /api/v1/user/me/link-google-account` with the password in a
header or query string. Rejected — a secret in a query string ends up in access logs.

**4. Unlink requires the current password.** Without it, anyone holding a stolen access
token could sever the account's Google link — a cheap denial-of-access move, and for a
user who had _just_ set a password, a way to strip the identity they actually use. The
password check also makes the "no password" case unreachable by accident.

**5. Guard order in the unlink handler: not-linked, then no-password, then wrong
password.** `UserHasNoLinkedGoogleAccountError` (409) first, because it is a statement about
the request being moot rather than about credentials; then `CannotUnlinkWithoutPasswordError` (409),
which tells the user what to do (set a password first); then
`InvalidCredentialsError` (401). Both 409s describe account state, matching how the
existing link errors use `ConflictError`.

**6. Setting a first password revokes other sessions; unlinking revokes nothing.**
Setting a password mirrors a password change — other devices should be re-authenticated
against the new credential, and the acting session is preserved because it just
performed the action (the other-session sign-out). Unlinking removes an alternative sign-in
route but does not change the credential any session was issued against, so revoking
would be gratuitous.
_Alternative considered:_ revoking everything on unlink, on the theory that the Google
identity may be the compromised thing. Rejected — a compromised Google identity is
handled by unlinking it, which is precisely what just happened; and the user is
mid-flow on the device they are using.

**7. `unlinkGoogleAccount(userId)` sets `googleId: null` and nothing else.** The
existing `linkGoogleAccount` then works again unchanged, including its guard against
claiming an identity already linked elsewhere, so relinking to a different Google
account needs no new code. Worth an explicit test rather than new logic.

**8. No new `403` surface.** Both endpoints act on the caller's own account, resolved
from `request.user.sub`, with no `@Role` decorator — every authenticated role may
manage its own credentials, exactly as the profile and password endpoints do.

## Risks / Trade-offs

- **[Two endpoints on one path with different verbs and opposite preconditions]** A
  client calling `POST` on an account that has a password gets a 409 and must retry
  with `PATCH`. → Accepted; the alternative (decision 1) hides the distinction behind
  conditional validation. Swagger documents both preconditions explicitly.
- **[A first password can be set from a stolen access token]** Someone who steals a
  Google-only user's access token can set a password and then hold a credential that
  outlives the token. → Real, and inherent to the feature: the 15-minute token is the
  only proof the account has. Mitigated by revoking other sessions on success (the
  legitimate user is signed out of their other devices, which is a visible signal) and
  bounded by the same exposure any authenticated write already carries.
- **[Unlink then lose the password]** A user who unlinks and then forgets their password
  falls back on password reset, which needs their email address to be deliverable. If
  the address was a Google-hosted one they no longer control, they are locked out. →
  Out of the API's hands; noted so the frontend can warn at unlink time.
