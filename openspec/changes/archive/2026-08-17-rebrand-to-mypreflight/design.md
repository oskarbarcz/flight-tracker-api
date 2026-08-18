## Context

See `proposal.md` § Why for motivation. The two capability specs touched are the ones whose
requirements quote the product name.

Three pieces of current state shape the approach:

**The name lived in four kinds of place.** User-facing copy (Discord messages, email
bodies), API metadata (Swagger title and server URL), environment configuration (mail
sender, OAuth redirect URIs) and infrastructure identifiers (the deploy target, the npm
package name, a Discord asset key). Only the first two are product copy; the rest are
identifiers whose value is load-bearing somewhere outside this repository.

**The front-end origin is named in three files.** `cors.config.ts`, `helmet.config.ts` and
the Discord redirect allow-list each hard-code the production front end, gated on
`NODE_ENV`. A rename that missed one would leave the front end unable to call the API, or
unable to complete a Discord sign-in, only in production.

**Message copy is centralised.** `discord-message.formatter.ts` renders every Discord body,
and its colocated spec pins the exact strings. The two email listeners write their own
copy inline. So the rename touches one formatter, two listeners, and the tests that quote
them — not every call site.

## Goals / Non-Goals

**Goals:**

- One name everywhere a user reads one.
- Let the front end move to mypreflight.io without a follow-up API change.
- Leave the README readable as a product introduction, with contributor material findable
  in its own documents.

**Non-Goals:**

- Renaming the repository, the npm package, the Docker image name or the git history.
- Renaming the Discord application or its uploaded assets.
- Changing any endpoint path, payload field or event name — nothing in the API surface
  carries the product name.
- Retiring the old domain. That is a DNS and front-end concern; the API simply stops
  naming the old host.

## Decisions

### Product copy is renamed; identifiers are not

Renamed: Discord message copy, email bodies, Swagger title, production server URL, CORS
origin, CSP connect target, OAuth redirect URI, mail sender display name, `homepage`.
Left alone: the npm package name `flight-tracker-api`, the Swagger contact address, and the
Discord presence small-image key `flight-tracker`.

_Why:_ an identifier's value is a reference, not a message. The package name appears in
lockfiles and image tags; the asset key names a file already uploaded to Discord and
renaming it would show a broken image; the contact address is a working mailbox. None of
them is read by a user as the product's name, and each would cost something real to change.

_Consequence:_ a reader of `package.json` or the Discord asset list still sees the old name.
Accepted, and recorded here so it reads as a decision rather than an oversight.

### Integrity checks split into a files job and a code job

`files` runs the line-ending, permission and version-uniqueness checks with shared actions;
`code` brings the compose stack up and runs format, lint and the functional suite.

_Why:_ the cheap checks now fail in seconds without waiting for a Docker build, and the
version-uniqueness check stops being a bespoke shell script in `docker/ci/` that duplicated
an action already available. It also removes the `paths` filter that previously skipped the
whole workflow for Markdown-only changes — the file checks are exactly what should still run
on a docs commit.

### The README becomes product-facing, with three documents behind it

`docs/DISCORD.md`, `docs/EMAILS.md` and `docs/WEBSOCKETS.md` take the material a
contributor needs; the README keeps the introduction, the quick start and the pointers.

_Why:_ the README was serving two audiences and answering neither quickly. Splitting by
subsystem also means the Discord contract can grow without pushing the quick start further
down the page.

_Consequence:_ anything that linked to "README § Discord" now points at `docs/DISCORD.md`,
including the project instructions.

## Risks / Trade-offs

**Environment drift breaks sign-in silently** → `DISCORD_OAUTH_REDIRECT_URIS` and
`MAIL_FROM_ADDRESS` are configuration, so `.env.dist` changing does not update a running
environment. A stale redirect list rejects the Discord callback with an OAuth error that
looks like a Discord problem. Called out in the proposal's Impact so the deploy checklist
carries it.

**Two names in circulation during the transition** → users who bookmarked the old front end
reach a host the API no longer allows as an origin. Unavoidable in a rename; the alternative
is allowing both origins indefinitely, which keeps the old name alive in the security policy.

**A large diff that is mostly prose** → the README rewrite and the workflow reformatting
dominate the change, making the behavioural parts (three config constants, the message copy)
easy to lose. They are enumerated in the task list for exactly that reason.

## Migration Plan

1. Rename the copy: formatter, email listeners, Swagger title, and the tests quoting them.
2. Point CORS, Helmet and Swagger at the new domain.
3. Update `.env.dist`, then the same two variables in every deployed environment.
4. Rewrite the README and add the three `docs/` documents.
5. Update both workflows, delete `docker/ci/check_version_is_free`, and rename the deploy
   target.

**Rollback:** revert the commit. Nothing persists the name and no data carries it; the only
external state involved is the two environment variables, which have to be reverted with it.
