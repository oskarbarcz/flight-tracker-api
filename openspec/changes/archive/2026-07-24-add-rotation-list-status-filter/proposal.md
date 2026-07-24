## Why

An operator accumulates rotations across the whole `draft → ready → in_progress →
finished` lifecycle, but the list endpoint returns all of them at once with no way
to narrow to a state. Planning views want just the drafts; operating views want just
the ready/in-progress ones. A state filter makes the list usable without client-side
filtering.

## What Changes

- Add an optional `status` query parameter to `GET /api/v1/operator/:operatorId/rotation`
  that filters the returned rotations by their state (`draft`, `ready`, `in_progress`,
  `finished`). Omitting it returns all of the operator's rotations (unchanged
  behaviour). An unrecognised value is rejected with `400`.

No breaking changes: the parameter is optional and additive.

## Capabilities

### New Capabilities

- _None._

### Modified Capabilities

- `rotation-management`: adds a requirement that the operator rotation list can be
  filtered by rotation state.

## Impact

- **`rotations` module:** new `ListRotationsFilters` query DTO (`status?` validated
  against `RotationStatus`); `ListRotationsAction` reads `@Query()`; `ListRotationsQuery`
  carries an optional `status`; `RotationsRepository.findAll` criteria gains `status`
  (the method already builds a Prisma `where` from its criteria).
- **No schema change.**
- **Functional tests:** new `features/rotation/rotation.list.feature` — unfiltered list,
  filter by a state, and an invalid state rejected (`400`), with full-body assertions.
