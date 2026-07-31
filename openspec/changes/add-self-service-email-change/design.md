## Context

This change is the fourth in the self-service credential sequence and reuses almost
all of its machinery. In place by the time it starts: the Mailgun provider with its
file-writing test client, the `UserToken` table (hashed, single-use, expiring tokens
with a `type` discriminator, plus supersede-on-issue and a 5-minute re-send guard),
`UsersRepository.verifyPassword`, `PasswordNotSetError`, `SessionService.closeAllForUser`,
and `features/_context/mail.context.ts`.

Two existing properties shape the design:

- `user.email` is `@unique` and appears in the JWT payload (`JwtUser.email`), so
  changing it makes every already-issued token carry a stale claim.
- `POST /api/v1/auth/google` resolves users by `googleId` **only**, never by email —
  `README.md` calls this out as an account-takeover guard. A mutable email makes that
  rule load-bearing rather than merely prudent.

The `USER_ME` cache entry is keyed per user and is already invalidated by
`UsersRepository.update`, `setCurrentFlight`, and `setLastAirport`.

## Goals / Non-Goals

**Goals:**

- An email address change that only takes effect once someone has read mail at the
  new address.
- No window in which either address half-works.
- Reuse the token, mail, and credential primitives as-is; add one enum value and one
  column.

**Non-Goals:**

- Verifying email addresses at sign-up. Addresses created by the admin endpoint stay
  unverified; only _changes_ are confirmed.
- An explicit "cancel my pending change" endpoint — requesting another change
  supersedes the pending one, and a pending change expires on its own.
- Exposing the pending address in any read model (`GET /api/v1/user/me` and the user
  list keep showing the confirmed address only).
- Letting a Google-only account change its email. That needs a password first, which
  is the Google-unlink change.
- Re-issuing tokens to the old address, or a grace period during which the old
  address still signs in after confirmation.

## Decisions

**1. The pending address lives on the token row, not on `User`.**
`UserToken` gains `newEmail String?`; `UserTokenType` gains `email_change`. `User`
gets no `pendingEmail` column. This is what makes "the pending address cannot be
used" true by construction rather than by discipline: no query that resolves a user
by email can accidentally match a pending one, because the value is not on the user
at all. Supersede-on-issue already guarantees at most one pending change per user.
_Alternative considered:_ `User.pendingEmail` + `User.pendingEmailToken`. Rejected —
it puts an unconfirmed, non-unique address next to the unique confirmed one, where
every `findOneBy({ email })` caller has to remember which is which.

**2. The current password is required, and it is the Google-only gate.**
Requiring `currentPassword` does two things at once: a stolen access token alone
cannot retarget an account's recovery channel, and an account with `password === null`
is excluded automatically (there is nothing to verify). The handler still throws
`PasswordNotSetError` (409) explicitly before verification, so a Google-only user
gets a comprehensible answer instead of a bare 401. Gating on `password === null`
rather than on `googleId !== null` is the same decision, and for the same reason, as
in the password-change change: link-only Google means ordinary password users have a
`googleId` too.

**3. Two messages: confirmation to the new address, notification to the old one.**
The confirmation link goes only to the new address — that is the proof. The old
address gets a plain notification with no action link, so the legitimate owner learns
about a change they did not request while they still control the account. Both are
sent from one `EmailChangeMailListener` reacting to a single
`EmailChangeRequestedEvent { userId, currentEmail, newEmail, token }`, keeping the
Mailgun calls out of the request path as decided for password reset.
_Alternative considered:_ notifying the old address only after confirmation. Rejected
— by then the attacker controls recovery, and the notification arrives at an address
the account no longer uses.

**4. Confirmation is `@SkipAuth()`.** The link is opened from a mailbox, plausibly on
another device or browser, so requiring the session that started the change would
strand users. The token is the authorisation, and it is single-use, 24-hour, and
bound to one user. The endpoint's response is identical whether or not a bearer token
is sent.

**5. 24-hour TTL, against the reset flow's 1 hour.** A password reset is used
immediately by someone actively locked out; an email-change confirmation may need the
user to get access to a different mailbox. The token is not a credential for the
account — worst case it applies an address the account holder already asked for — so
the longer window costs little.

**6. Availability is checked twice: at request and at confirmation.**
`email` is `@unique`, so an unchecked confirmation would fail on a Prisma constraint
error and surface as a 500. The request-time check gives a clean 409; the
confirmation-time re-check handles the interleaving where another account (created by
an admin, or another user's confirmed change) claimed the address in between. Both use
`isEmailTaken(email, exceptUserId)`.
_Trade-off:_ the request-time 409 tells an authenticated caller whether an address is
registered. Accepted — the caller must already hold a valid session _and_ that
account's password, the same `UserEmailAlreadyExistsError` signal already exists on
admin user creation, and the alternative (a silent 202 followed by no email and a
mysterious dead link) is materially worse for the honest case.

**7. Confirmation revokes every session.** The JWT payload embeds `email`, so after a
change every live access and refresh token carries a stale claim; and an identity
change is exactly when a full re-authentication is warranted. There is no acting
session to preserve — the endpoint is unauthenticated. `closeAllForUser`, as with
password reset. The `USER_ME` cache entry is invalidated in `setEmail` alongside it,
or `GET /api/v1/user/me` would serve the old address for up to its TTL.

**8. Generic `InvalidEmailChangeTokenError extends BadRequestError` (400)** for
unknown, expired, superseded, and consumed tokens, mirroring the reset flow's single
opaque error. The "address taken in the meantime" case is the one distinguishable
failure, and it is a 409, because the user needs to know their choice is unavailable
rather than that their link is broken.

**9. The 5-minute re-send guard applies here too**, reusing
`findRecentUnconsumed(userId, email_change, 5 min)`. Without it, an authenticated user
holding a password can be turned into a mail source aimed at any address they type
into `newEmail`. The response stays `202` when suppressed.

**10. A note is added to the README's Google Sign-In section.** That section already
forbids an email fallback in `POST /api/v1/auth/google`. This change makes email
mutable, so the note gains a sentence explaining _why_ the rule matters now:
otherwise a confirmed email change would silently retarget which account a Google
identity signs into. No code changes there — the guard is that no such fallback
exists.

## Risks / Trade-offs

- **[Request-time 409 is an existence oracle]** An authenticated caller can probe
  which addresses are registered, one per 5 minutes per account. → Accepted per
  decision 6; the caller is authenticated and password-verified, and the rate guard
  bounds probing.
- **[A confirmation email sent to a typo'd address]** A user who mistypes
  `newEmail` mails a stranger a link that would move the account to the stranger's
  address. → Bounded: the stranger must act within 24 hours, the account's current
  address is notified at request time, and requesting another change supersedes the
  token. Not eliminated — a "cancel pending change" endpoint would, and is noted as a
  non-goal.
- **[Stale access tokens survive revocation]** Revoking refresh tokens does not
  invalidate access tokens already issued, so a token carrying the old `email` claim
  is honoured for up to 15 minutes. → Pre-existing property of the session model; the
  claim is informational and authorisation uses `sub`.
- **[Unverified addresses still enter the system]** The admin create-user endpoint
  sets an address with no confirmation, so "the address on an account was proven" is
  true only for changed addresses. → Out of scope by design; flagged so nobody reads
  this change as delivering verified-email-at-signup.
