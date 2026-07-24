## Context

Rotations are currently read only through the operator-scoped, public endpoint
`GET /api/v1/operator/:operatorId/rotation` (`ListRotationsAction`, `@SkipAuth()`),
which supports an optional exact-match `status` filter and returns the full
`Rotation` shape (legs, computed block time, `createdBy`/`updatedBy`). A rotation
already carries the assigned pilot as `rotation.pilotId` (relation
`PilotRotations`), and `pilotId` is indexed (`@@index([pilotId])`).

The `/me` convention already exists in the codebase: the statistics module mounts
caller-scoped endpoints on `@Controller('/api/v1/user')` with paths like
`/me/stats`, resolving the caller from `request.user.sub` (an `AuthorizedRequest`
behind the default JWT guard). This change follows that convention for rotations.

`RotationsRepository.findAll(criteria)` builds its Prisma `where` by spreading the
criteria object, which supports only equality (`operatorId`, `pilotId`, single
`status`). "At least ready" needs a set membership (`status IN (…)`), which the
spread form cannot express.

## Goals / Non-Goals

**Goals:**

- Add `GET /api/v1/user/me/rotations` returning the caller's rotations in state
  `ready`, `in_progress`, or `finished`, using the existing `Rotation` response
  shape.
- Keep the endpoint authenticated (self-scoped) and available to any signed-in
  role.
- Reuse existing model/mapping code; add the minimum new query + repository read.

**Non-Goals:**

- No pagination, sorting options, or additional query filters (out of scope; the
  result set is one pilot's non-draft rotations).
- No caching layer for this endpoint.
- No change to the existing operator-scoped list or its public-read behavior.
- No schema change.

## Decisions

**1. Filter to `ready`/`in_progress`/`finished` (interpret "at least ready"
literally).**
`RotationStatus` is ordered `draft → ready → in_progress → finished`. "At least
ready" is read as "state ≥ `ready`", i.e. the set `{ready, in_progress, finished}`,
excluding only `draft`. Finished rotations are included because they are still the
pilot's rotations and satisfy the threshold; the endpoint is a "my rotations" view,
not a "to fly next" queue. The set is defined once as a constant derived from the
enum rather than hardcoded, so a future state added after `ready` is included
automatically.
_Alternative considered:_ exclude `finished`. Rejected — it contradicts the literal
threshold and would need its own explicit requirement.

**2. New dedicated query `ListAssignedRotationsQuery(pilotId)` + handler**, rather
than overloading `ListRotationsQuery` (which is operator-scoped with a single
optional status). A separate query keeps the two read paths — operator roster vs.
pilot self-view — independent and each trivially readable, matching the module's
one-query-per-read-shape style.
_Alternative considered:_ extend `ListRotationsQuery` with `pilotId` + a status set.
Rejected — it muddies an endpoint that is public and operator-scoped with concerns
that are authenticated and caller-scoped.

**3. New repository read `findAssignedToPilot(pilotId, statuses)`** that issues
`where: { pilotId, status: { in: statuses } }` with the shared `rotationInclude`
and `toModel` mapping, ordered by `createdAt` asc (consistent with `findAll`).
Kept separate from `findAll` so the existing equality-spread `findAll` stays as-is.
_Alternative considered:_ generalize `findAll` to accept `statuses?: RotationStatus[]`
and build the `where` explicitly. Rejected as a larger refactor of a method the
operator list depends on, for no shared benefit.

**4. Action mounted in the rotations module**, on `@Controller('/api/v1/user')`
with `@Get('/me/rotations')`, no `@SkipAuth()` and no `@Role(...)`. Authentication
is required (the caller identity defines the result); every authenticated role may
read its own list. The action reads `request.user.sub`, dispatches the query, and
returns `Rotation[]`. This mirrors the statistics `/me` actions while keeping
rotation logic inside the rotations module.

**5. No caching.** Rotation state changes reactively via the flight-lifecycle
listener (`ready → in_progress → finished`), so a cached list would go stale on
transitions the pilot most cares about. Freshness beats the marginal read savings
here; the query is a single indexed lookup.

## Risks / Trade-offs

- **[Empty list vs. 404]** A user with no assigned non-draft rotations gets an
  empty array with `200`, not a `404`. → This matches list semantics elsewhere in
  the API and is the correct REST behavior for a collection.
- **[Including `finished` grows the list over time]** A long-serving pilot
  accumulates finished rotations, so the unpaginated list could grow large. →
  Acceptable for now given expected volumes; pagination can be added later as a
  purely additive change without altering the contract.
- **[Status stored as free-form `String`]** `rotation.status` is a Prisma `String`,
  not a DB enum, so the `IN` set is only as correct as the values written by the
  domain. → The write side already constrains transitions through
  `RotationStatus`; the read maps back through the same enum in `toModel`.
