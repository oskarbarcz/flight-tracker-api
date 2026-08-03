## Context

`add-self-service-email-change` and `add-forgotten-password-reset` had just landed, so
in place already: the `user_token` table holding a pending address on the token row, the
Mailgun provider, and confirmed self-service email changes. `GET /api/v1/user/me`
returned a single `email` string, `user.email` is `@unique` and appears in the JWT
payload, and the own-details read is cached per user with a one-minute TTL.

Two properties of what existed shaped this change: the pending address deliberately does
**not** live on `user` (so that no `findOneBy({ email })` can match it), and the
administrative update endpoint accepted `email`, which the confirmed-change flow had
just made redundant.

## Goals / Non-Goals

**Goals:**

- Let an account see every address it holds and the state of each.
- Make "was this address proven?" a stored fact rather than an assumption.
- Keep one source of truth for the pending address.
- Leave the existing `email` field and the administrative read models alone.

**Non-Goals:**

- Multiple simultaneously usable addresses. The list describes one active address plus
  at most one pending one; it is not an alias system.
- Confirming addresses that already exist, or forcing existing users through
  confirmation.
- Exposing when an address was confirmed.
- A self-service way to cancel a pending change — still superseded-or-expired only.

## Decisions

**1. Confirmation state is a nullable timestamp on `user`, not a boolean and not a
table.** `emailConfirmedAt DateTime?` — null means unproven. A timestamp costs the same
as a boolean and answers "when", which an audit question will eventually ask; a
`user_email` table was rejected because it would fork the source of truth for sign-in
resolution and the unique constraint, and would store the pending address in a second
place next to the token row that already owns it.
_Alternative considered:_ deriving `isConfirmed` with no column at all. Rejected — it
makes the flag a constant (`isConfirmed == active`), so it tells a client nothing and
cannot distinguish an administratively typed address from a proven one.

**2. Existing rows are backfilled as confirmed; administratively created addresses are
not.** The migration sets `emailConfirmedAt = NOW()` for every row that predates the
column: those accounts are in use, and retroactively marking them unproven would imply
a confirmation flow that never existed for them. Going forward an address someone else
typed is unconfirmed, which is the honest reading and what makes the flag informative.

**3. The pending address is composed at read time, never stored on the user.** The
own-details handler asks the `auth` module for the outstanding `email_change` token
through the query bus and appends it as `{ active: false, isConfirmed: false }`. This
keeps decision 1 of the email-change design intact — the pending address exists in
exactly one place — and it means no new invalidation path can leave a stale pending
address behind on `user`.
_Trade-off:_ one extra query per own-details read. Acceptable: it is a single indexed
lookup on `(userId, type)` behind a cached endpoint.

**4. The read crosses modules over the query bus, not by injecting a repository.**
`auth` already imports `users`; injecting `UserTokenRepository` into the `users` module
would close that loop. A query dispatched to the owning module is the pattern the
codebase uses for cross-module reads, and `CqrsModule` is global, so no module import is
needed in either direction.

**5. `emails` is added; `email` stays.** Removing `email` would break every existing
reader and every full-body assertion for no gain. `email` remains the active address —
the same value that appears as the `active: true` entry.

**6. Requesting a change invalidates the own-details cache.** Nothing on `user` changes
when a change goes pending, so there is no repository write to hang the invalidation on;
a listener on the existing `EmailChangeRequestedEvent` clears the entry instead. Without
it the new pending row would be invisible for up to the cache TTL, which reads as the
request having silently failed.
_Accepted gap:_ when a pending token merely expires, the entry can still be served for
up to the TTL. Bounded and self-correcting.

**7. `email` is removed from the administrative update payload rather than reset to
unconfirmed on change.** The earlier draft let an administrator change an address and
dropped confirmation. That still leaves an administrator able to point an account at an
address they control, which — with password reset live — is the takeover path this
sequence set out to close. With the field absent, the global validation pipe already
rejects it (`forbidNonWhitelisted`), so the guarantee needs no handler code.
_Consequence:_ there is no administrative recovery for a user who loses access to their
address; that would be a deliberate, audited capability rather than a side effect of a
general update endpoint.

**8. Authenticated self-service actions are action-shaped paths under `/api/v1/user/me`.**
`change-email`, `change-password`, `link-google-account` are calls to action on one's own
account, not resources under `auth`, and grouping them under the `user` tag puts
everything a signed-in user can do to their own account in one place. `/api/v1/auth`
keeps what works without a session.
_Known wart:_ `change-email/confirm` is `@SkipAuth()` — the link is opened from a
mailbox, so there is no "me" in that request — yet it sits under `/user/me` to stay
beside the request it completes. The token is the authorisation.

## Risks / Trade-offs

- **[`isConfirmed` means less than it appears]** Nothing forces confirmation, so an
  unconfirmed address keeps working exactly as before — the flag is informational, not a
  gate. → Documented as such; gating anything on it would be a separate decision.
- **[No administrative address recovery]** A user who cannot read their address can no
  longer be helped by an administrator through the update endpoint. → Accepted per
  decision 7; the honest fix is an explicit, audited capability.
- **[Endpoint moves break unreleased clients]** Four paths changed. → Nothing is
  released; the frontend picks them up in the same cycle.
