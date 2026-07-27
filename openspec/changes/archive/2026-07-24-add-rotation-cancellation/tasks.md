## 1. Domain state and error

- [x] 1.1 Add `Canceled = 'canceled'` to the `RotationStatus` enum in `model/rotation.model.ts`.
- [x] 1.2 Add `RotationNotCancelableError extends ConflictError` to `model/error/rotation.error.ts` (message: only a ready rotation can be cancelled).

## 2. Command

- [x] 2.1 Add `CancelRotationCommand(rotationId, actorId)` + `CancelRotationHandler` under `application/command/`: load via `findById` (throw `RotationNotFoundError` if missing), throw `RotationNotCancelableError` unless `status === RotationStatus.Ready`, then `updateStatus(rotationId, RotationStatus.Canceled, actorId)`.

## 3. HTTP action

- [x] 3.1 Add `CancelRotationAction` under `infra/http/action/`: `@Controller('/api/v1/rotation')`, `@Post(':rotationId/cancel')`, `@HttpCode(HttpStatus.OK)`, `@Role(UserRole.Operations)`; dispatch `CancelRotationCommand(rotationId, request.user.sub)` (assigned to a `const`), then read back with `GetRotationByIdQuery` and return the `Rotation`.
- [x] 3.2 Add Swagger metadata mirroring `MarkRotationReadyAction` (`@ApiTags('rotation')`, `@ApiBearerAuth('jwt')`, `@ApiOkResponse({ type: Rotation })`, unauthorized/forbidden/not-found/conflict responses).

## 4. Module wiring

- [x] 4.1 Register `CancelRotationHandler` in `providers` and `CancelRotationAction` in `controllers` of `rotations.module.ts`.

## 5. Seed data

- [x] 5.1 No dedicated seed needed: the happy-path cancels the seeded `ready` rotation `97f99ca3` and ends with "I set database to initial state" (the established reset-after-mutation convention), so no fixture that other features assert on is left mutated.

## 6. Functional tests

- [x] 6.1 Add `features/rotation/rotation.cancel.feature`, happy path: signed in as `operations`, `POST /api/v1/rotation/97f99ca3.../cancel` returns `200` with the full rotation body showing `status: "canceled"`, `updatedBy` = the acting Operations user, and `updatedAt` = `@date('within 1 minute from now')`; resets after.
- [x] 6.2 Reject cancellation from every non-ready state with `409`: a `draft`, an `in_progress`, and a `finished` seeded rotation, plus already-`canceled` (cancel `97f99ca3` twice — second call `409`); plus a `404` for a non-existent rotation.
- [x] 6.3 Operations-gated actor matrix: admin `403`, cabin-crew `403`, unauthenticated `401`.
- [x] 6.4 Update the invalid-`status` assertion in `features/rotation/rotation.list.feature` so the expected validation message lists `canceled` among the valid states.

## 7. Unit test

- [x] 7.1 Extend `application/event/external/flight-lifecycle.listener.spec.ts`: a `PilotCheckedIn` event on a flight attached to a leg of a `canceled` rotation does not call `updateStatus` (the rotation stays `canceled`).

## 8. Verify

- [x] 8.1 `docker compose exec app npm run lint` and `npm run build` pass.
- [x] 8.2 `docker compose exec app npm test -- flight-lifecycle.listener` passes.
- [x] 8.3 `docker compose exec app npx cucumber-js features/rotation/rotation.cancel.feature` passes; then the full `features/rotation` suite still passes (confirms the updated `rotation.list.feature` message and no lifecycle regressions).
