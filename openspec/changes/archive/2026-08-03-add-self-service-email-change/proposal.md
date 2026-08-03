## Why

A user's email address is their sign-in identifier and the channel every account
recovery runs through, yet the only way to change it is the admin-only
`PATCH /api/v1/user/:id`. A user who changes employer or mailbox has to ask an
administrator, and that administrator can point an account at any address they like
— with password reset already in place, that is a full account takeover primitive.
A user must be able to move their own address, and the system must not accept an
address until whoever asked for it has proven they can read mail there.

## What Changes

- Add `POST /api/v1/auth/email-change` (authenticated) taking `newEmail` and
  `currentPassword`. It records a **pending** change and answers `202`; it does not
  touch the account's email address.
- A confirmation email carrying a one-time link is sent to the **new** address —
  that message is what proves control of it. A separate notification is sent to the
  **current** address so the legitimate owner notices a change they did not start.
- Add `POST /api/v1/auth/email-change/confirm` (unauthenticated, because the link
  may be opened in a different browser) taking `token`. On success the account's
  email becomes the new address, the token is consumed, every session is revoked,
  and the response is `204`.
- Until confirmation, the account keeps working on the old address: sign-in,
  password reset, and the user's own profile all still use it. The pending address
  is not an alias and cannot be used to sign in.
- The current password is required, which also means an account with no password
  (Google-only) cannot change its email — consistent with the password-change
  endpoint, and blocked by the same conflict error.
- Rejected up front: an address equal to the current one, and an address already
  registered to another account. Uniqueness is re-checked at confirmation time,
  since another account may have claimed the address in between.
- Confirmation tokens are valid for 24 hours, are single-use, and a new request
  supersedes any pending change.

No breaking API changes: two new endpoints and one nullable column.

## Capabilities

### New Capabilities

- `user-email-change`: an authenticated user moves their account to a new email
  address, which takes effect only once control of that address is proven.

### Modified Capabilities

- _None._ `user-password-reset` and `user-password-change` are untouched; this change
  only adds a second token type to the machinery they introduced.

## Impact

- **Depends on `add-forgotten-password-reset`** for the Mailgun provider, the
  `UserToken` table, and `features/_context/mail.context.ts`; and on
  `add-self-service-password-change` for `UsersRepository.verifyPassword` and
  `PasswordNotSetError`. Both must land first.
- **Prisma:** `UserTokenType` gains `email_change`; `UserToken` gains a nullable
  `newEmail` column holding the requested address. Migration plus a local
  `prisma db push`.
- **`auth` module:** `RequestEmailChangeCommand` and `ConfirmEmailChangeCommand` +
  handlers; two actions; an `EmailChangeMailListener` reacting to a new
  `EmailChangeRequestedEvent` and sending both messages; new errors
  (`EmailAlreadyInUseError`, `NewEmailMustDifferError`,
  `InvalidEmailChangeTokenError`).
- **`users` module:** `UsersRepository` gains `setEmail(userId, email)` and an
  `isEmailTaken(email, exceptUserId)` helper; the existing `USER_ME` cache entry is
  invalidated on confirmation.
- **Two new mail message types** in the Mailgun provider's `MailMessageType`.
- **Functional tests:** new `features/auth/auth.email-change.feature`.
- **`README.md`:** the Google Sign-In section states that `POST /api/v1/auth/google`
  resolves users by `googleId` only and must never fall back to email. That stays
  true and becomes more important — this change makes a user's email mutable, so an
  email fallback would let an email change silently retarget a Google identity. A
  note is added there.
