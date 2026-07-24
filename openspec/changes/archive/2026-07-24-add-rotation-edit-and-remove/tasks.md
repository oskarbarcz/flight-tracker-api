## 1. Domain

- [x] 1.1 Add `RotationNotEditableError` and `RotationNotDeletableError` (both `ConflictError` → 409) in `model/error/rotation.error.ts`.
- [x] 1.2 Add `EditRotationRequest` DTO (`name`, `pilotId`) in `infra/http/request/rotation.request.ts`.
- [x] 1.3 Add `RotationsRepository.update(id, name, pilotId, actorId)` and `.delete(id)`.

## 2. Application

- [x] 2.1 `EditRotationCommand` + handler: not-found → 404, non-draft → `RotationNotEditableError`, else update.
- [x] 2.2 `RemoveRotationCommand` + handler: not-found → 404, non-draft → `RotationNotDeletableError`, else delete.

## 3. HTTP

- [x] 3.1 `EditRotationAction` — `PATCH /api/v1/rotation/:rotationId`, Operations-gated, write-then-read returning the rotation.
- [x] 3.2 `RemoveRotationAction` — `DELETE /api/v1/rotation/:rotationId`, Operations-gated, `204 No Content`.
- [x] 3.3 Move the five leg-scoped actions (`add-leg`, `update-leg`, `remove-leg`, `attach-flight`, `detach-flight`) to `@ApiTags('rotation leg')`.
- [x] 3.4 Register the two handlers and two actions in `rotations.module.ts`.

## 4. Tests & verification

- [x] 4.1 `features/rotation/rotation.edit.feature` — happy path (full body), `409` guard, `404`, RBAC `403`/`401`; full-body assertions; reset on mutating scenario.
- [x] 4.2 `features/rotation/rotation.remove.feature` — `204` + gone (`404`), `409` guard, `404`, RBAC `403`/`401`; full-body assertions; reset on mutating scenario.
- [x] 4.3 Lint / format / `nest build` clean; rotation suite (42) and full functional suite (772) green.
