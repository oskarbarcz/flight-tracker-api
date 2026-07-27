## Why

Once a rotation is marked `ready` it is committed to the schedule, but plans
change — a rotation may need to be called off before any flight is flown.
Today the lifecycle only moves forward (`ready → in_progress → finished`), and a
`ready` rotation cannot be removed (removal is draft-only). Operations has no way
to retire a ready rotation, leaving stale ready rotations on pilots' schedules.

## What Changes

- Add a `canceled` rotation state and an Operations-only action to cancel a
  `ready` rotation: `POST /api/v1/rotation/:rotationId/cancel`, which transitions
  the rotation to `canceled` and returns the updated rotation.
- Cancellation is allowed **only from `ready`**. Attempting to cancel a `draft`,
  `in_progress`, `finished`, or already-`canceled` rotation is rejected with a
  conflict (`409`).
- `canceled` is a terminal state: the automatic lifecycle transitions
  (check-in → `in_progress`, last-flight-close → `finished`) already guard on the
  source state, so a canceled rotation is inert and never advances.
- Extend `RotationStatus` with `canceled`, so it becomes a selectable value of the
  operator rotation list's `status` filter.

No breaking API changes: this is a new action plus one additive enum value.

## Capabilities

### New Capabilities

- _None._

### Modified Capabilities

- `rotation-management`: adds a requirement that Operations can cancel a `ready`
  rotation, introducing the terminal `canceled` state.

## Impact

- **`rotations` module:** new `CancelRotationCommand` + handler (guards
  `status === ready`, else `RotationNotCancelableError`); new `CancelRotationAction`
  (`POST :rotationId/cancel`, `@Role(UserRole.Operations)`, write-then-read);
  `RotationStatus` enum gains `Canceled`; new `RotationNotCancelableError`
  (`ConflictError` → 409). Both registered in `rotations.module.ts`.
- **No schema/migration change** — `rotation.status` is a free-form `String`
  column, so the new value needs no migration.
- **Existing test to update:** `features/rotation/rotation.list.feature` asserts
  the exact enum-validation message for an invalid `status` filter; adding
  `canceled` changes that message, so that expectation is updated to include it.
- **Functional tests:** new `features/rotation/rotation.cancel.feature` — cancel a
  `ready` rotation, reject cancelling from every other state (`409`), and the
  Operations-gated actor matrix (Operations succeeds; admin/cabin-crew `403`;
  unauthenticated `401`).
