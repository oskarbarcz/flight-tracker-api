## Why

Operations can create a rotation and build its legs, but once created there was no
way to correct the rotation's own attributes (its name or assigned pilot) or to
delete a rotation planned in error. Both are needed while a rotation is still being
planned — i.e. before it is committed by being marked ready. The rotation endpoints
were also all grouped under a single Swagger tag, mixing rotation-level operations
with per-leg operations and making the API harder to read.

## What Changes

- **Edit rotation** — `PATCH /api/v1/rotation/:rotationId` updates a rotation's
  `name` and `pilotId`, returns the updated rotation, and records audit metadata
  (`updatedBy` / `updatedAt`). Operations-gated.
- **Remove rotation** — `DELETE /api/v1/rotation/:rotationId` deletes a rotation
  (its legs cascade). Returns `204`. Operations-gated.
- **Draft-only guard** — both edit and remove are allowed only while the rotation is
  a `draft`; once it has been marked ready (or is in-progress/finished) the request
  is rejected `409 Conflict`.
- **Swagger grouping** — the five leg-scoped endpoints (`add-leg`, `update-leg`,
  `remove-leg`, `attach-flight`, `detach-flight`) move to a dedicated `rotation leg`
  API tag; rotation-level endpoints (`create`, `edit`, `get`, `list`, `mark-ready`,
  `remove`) stay under `rotation`. Documentation-only; no behavior change.

No breaking changes: all additions plus a docs-only regrouping.

## Capabilities

### New Capabilities

- _None._

### Modified Capabilities

- `rotation-management`: adds the "edit a draft rotation" and "remove a draft
  rotation" requirements (both draft-only, Operations-gated).

## Impact

- **`rotations` module:** new `EditRotationCommand` / `RemoveRotationCommand`
  handlers and `EditRotationAction` (`PATCH`) / `RemoveRotationAction` (`DELETE`)
  controllers; `RotationsRepository.update()` and `.delete()`; new
  `EditRotationRequest` DTO; new `RotationNotEditableError` /
  `RotationNotDeletableError` (both `ConflictError` → 409). Handlers and controllers
  registered in `rotations.module.ts`. `@ApiTags('rotation leg')` applied to the five
  leg-scoped actions.
- **No schema change:** operates on the existing `Rotation` / `RotationLeg` models.
- **Functional tests:** new `features/rotation/rotation.edit.feature` and
  `features/rotation/rotation.remove.feature` — happy path (full-body assert),
  draft-only guard (`409`), not-found (`404`), and RBAC (Operations ✓, admin/cabin
  crew `403`, unauthenticated `401`), full-body assertions throughout, with
  `I set database to initial state` resets on the mutating scenarios.
