## Why

Once a user can move their own address, "what address does this account have, and did
anyone ever prove it?" becomes a question the API could not answer. The active address
was readable, but a pending change was invisible to its own owner, and nothing recorded
whether an address had ever been confirmed — so a frontend could not tell a proven
address from one an administrator typed in.

Two adjacent problems surfaced while closing that gap. An administrator could still
retarget any account's address through `PATCH /api/v1/user/:id`, which — with password
reset in place — is an account-takeover path that the confirmed self-service flow was
built to remove. And the self-service endpoints had landed under `/api/v1/auth` with
noun-shaped paths, so authenticated actions on one's own account were split across two
Swagger groups and read as resources rather than as the actions they are.

## What Changes

- `GET /api/v1/user/me` reports an `emails` array: every address of the account with
  whether it is confirmed and whether it is the one the account signs in with. The
  existing `email` field is untouched, so current readers keep working.
- Confirmation state is recorded per user. Addresses that existed before it was
  recorded count as confirmed; an address an administrator sets on creation does not.
  Completing an email change confirms the address it activates.
- A pending address is composed from the outstanding change token rather than stored on
  the user, so no lookup by email can ever match an unconfirmed address.
- The pending row appears immediately: requesting a change discards the cached copy of
  the user's own details.
- `email` is removed from the administrative update payload. An address now changes only
  through a self-service change the new address confirmed; supplying one is rejected.
- Authenticated self-service actions move to action-shaped paths under
  `/api/v1/user/me` and into the `user` Swagger group: `change-email`,
  `change-email/confirm`, `change-password`, `link-google-account`. `/api/v1/auth` keeps
  only what works without a session, including `reset-password`. Travel endpoints get
  their own `user travel` group.
- Swagger operation descriptions that restated their own summary or status codes are
  gone; the behaviour lives in these specs.

No breaking change to any released client: one nullable column, one added response
field, and endpoint moves that predate any release.

## Capabilities

### New Capabilities

- _None._ This extends read models and rules of capabilities that already exist.

### Modified Capabilities

- `user-profile-self-service`: own details list the account's addresses with
  confirmation state; only the account holder can move its address.
- `user-email-change`: a pending address may be reported to its own account, and a
  changed address never retargets a linked external identity.

## Impact

- **Prisma:** `user.emailConfirmedAt DateTime?`, backfilled to `NOW()` for every row
  that predates it, in the same migration that adds the token table.
- **`users` module:** `GetOwnUserHandler` composes the address list and asks the `auth`
  module for the pending address over the query bus; `UsersRepository.findOwnById`
  returns the confirmation timestamp, which never reaches the response;
  `UsersRepository.setEmail` stamps confirmation; a cache listener drops the own-details
  cache entry when a change goes pending; `UpdateUserDto` omits `email`.
- **`auth` module:** `GetPendingEmailChangeQuery` + handler,
  `UserTokenRepository.findPending`, four action paths and tags changed.
- **Tests:** every own-details assertion gains `emails`; new scenarios for the
  unconfirmed case, the pending pair, the confirmed-after-change case, and the rejected
  administrative address change; a colocated spec for the composition.
- **Docs:** the README's endpoint and behaviour prose was removed in favour of these
  specs; it keeps only what is needed to run the project.
