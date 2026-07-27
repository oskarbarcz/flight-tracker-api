## Why

The only way to read rotations today is the operator-scoped, public list
(`GET /api/v1/operator/:operatorId/rotation`). A pilot who wants to see the
rotations assigned to them has to know their operator, call a public endpoint,
and filter the whole roster by `pilotId` and state on the client. Pilots need a
first-class, authenticated "my rotations" view that returns only the rotations
assigned to them that are actually actionable — everything from `ready` onward,
never drafts that operations is still building.

## What Changes

- Add `GET /api/v1/user/me/rotations` (authenticated; any signed-in user reads
  their own list) returning the rotations where the caller is the assigned pilot
  (`pilotId`) and whose state is **at least `ready`** — i.e. `ready`,
  `in_progress`, or `finished`. Draft rotations are never returned.
- The response reuses the existing `Rotation` shape (with legs, computed block
  time, and audit metadata), so it is identical to what the operator list
  returns, just scoped to the caller and filtered by state.
- Unlike the operator list, this endpoint is **not** public: it requires
  authentication because "me" is resolved from the JWT. Unauthenticated requests
  are rejected with `401`.
- Accept an optional `status` query parameter that narrows the result to a
  single state. Filtering by a state the endpoint does not expose (`draft`)
  returns an empty list; an unrecognised value is rejected with `400`.

No breaking changes: this is a new, additive endpoint.

## Capabilities

### New Capabilities

- _None._

### Modified Capabilities

- `rotation-management`: adds a requirement that a pilot can list, over an
  authenticated endpoint, the rotations assigned to them that are at least
  `ready`.

## Impact

- **`rotations` module:** new `ListAssignedRotationsAction` under
  `infra/http/action/` mounted on `/api/v1/user` (path `/me/rotations`, no
  `@SkipAuth()`); new `ListAssignedRotationsQuery` + handler carrying the
  caller's `pilotId`; new `RotationsRepository` read that filters by `pilotId`
  and a set of states (`status IN (…)`). Both the action and the handler are
  registered in `rotations.module.ts`.
- **No schema change** — `rotation.pilotId` and `rotation.status` already exist,
  and `rotation.pilotId` is already indexed (`@@index([pilotId])`).
- **Functional tests:** new `features/rotation/rotation.my-list.feature` —
  returns only the caller's `ready`/`in_progress`/`finished` rotations, excludes
  drafts and other pilots' rotations, and rejects the unauthenticated caller
  (`401`), with full-body assertions.
