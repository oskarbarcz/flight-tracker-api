## Context

See `proposal.md` § Why for motivation. This change has no delta specs: nothing a client can
observe changes.

Three pieces of current state shape the approach:

**The suite is serial and fail-fast.** `cucumber.js` sets `failFast: true` and the database
context resets and reseeds around the run, so scenarios cannot be parallelised without
rethinking the shared database. Making the suite faster therefore means making each scenario
cheaper, not running more of them at once.

**Sign-in is deliberately expensive.** `bcrypt` verification is slow by design and the JWT is
signed with an EC key. That cost is exactly right for the endpoint and exactly wrong for a
step whose purpose is only to obtain an actor.

**Access tokens last 15 minutes.** `SessionService` mints them with `ACCESS_TOKEN_TTL = '15m'`,
which is what makes reuse possible at all — and what bounds how long a cached token may be
reused for.

## Goals / Non-Goals

**Goals:**

- Stop paying for work already done: no re-type-checking, no re-authenticating.
- Keep one definition of who the test users are.
- Keep type errors failing the build, just not from inside Cucumber.

**Non-Goals:**

- Parallelising the suite. It shares one database and resets it globally; that is a larger
  change.
- Reducing what the scenarios assert, or dropping the sign-in feature's own coverage — the
  sign-in endpoint is still exercised directly by `features/auth/`.
- Making the reuse window configurable. One constant, chosen with margin, is enough.

## Decisions

### Tokens are cached per user with an 8-minute reuse window

`accessTokenFor(user)` returns a cached token when it was minted less than
`ACCESS_TOKEN_REUSE_WINDOW_MS = 8 * 60 * 1000` ago, and signs in otherwise.

_Why a window rather than caching forever:_ a token lives 15 minutes and a full suite run
takes longer than that, so an unbounded cache would eventually hand a scenario an expired
token and fail with a `401` that has nothing to do with the behaviour under test. Eight
minutes leaves seven minutes of headroom — more than any single scenario needs — while still
collapsing hundreds of sign-ins into a handful.

_Why keyed by user rather than by role:_ the table now includes named seed users
(`Alan Doe`, `Michael Doe`) alongside the three roles, and each needs its own token.

### One `bearerToken` variable replaces the token map

The current actor's token is held in a single nullable variable; the per-user cache is a
separate `Map`.

_Why:_ the old structure conflated two things in one record — a cache of tokens and a pointer
to the active one, the latter stored under a `currentRole` key inside the same map as the
tokens. Splitting them makes "who is acting" a variable and "what tokens do we hold" a map,
and removes the string key that was neither a role nor a token.

_Consequence:_ the Google sign-in step sets `bearerToken` directly from its own response,
because that token is minted by a different flow and must not enter the reuse cache.

### Type-checking moves out of the Cucumber run

`requireModule: ['ts-node/register/transpile-only']` in `cucumber.js`, plus a `typecheck`
script.

_Why:_ the compiler adds a fixed cost to every run and reports errors that `npm run build`
and the editor already report. Transpile-only keeps the runtime behaviour identical — the
same TypeScript is executed — and the explicit script keeps the check available in CI and
locally.

_Risk accepted:_ a type error in a step definition now surfaces as a runtime failure instead
of a compile error. The mitigation is that `typecheck` exists and the build still compiles the
application.

### The user table is typed by declaration

`const apiUsers: Record<ApiUserType, {email, password}> = {…}` instead of an object cast to
that type afterwards.

_Why:_ the cast let the union and the table disagree. Declaring the type makes a user
referenced in a feature file but absent from the table — or present in the table but missing
from the union — a compile error, which is the one thing the previous shape could not catch.

## Risks / Trade-offs

**A reused token hides session-specific behaviour** → a scenario that depends on a fresh
session, or on a session being revoked, must sign in explicitly rather than through the
shared step. The session features already do, since they assert on specific tokens.

**Transpile-only defers type errors to runtime** → paid deliberately, mitigated by the
`typecheck` script.

**Node 26 in the same change** → a runtime major bump is unrelated to the suite's speed and
carries its own risk, but it lands in the same pass because both are pipeline concerns and
the functional suite is what verifies the image works.

## Migration Plan

1. Switch `cucumber.js` to transpile-only and add the `typecheck` script.
2. Rework `rest-api.context.ts`: typed user table, token cache, exported helper, single
   bearer token.
3. Point `websocket.context.ts` at the exported helper and delete its duplicates.
4. Bump the base image to Node 26 and `@types/node` to match, then rebuild the stack.
5. Rework the release job's deploy step.

**Rollback:** revert the commit. No state is involved beyond the CI configuration.
