## 1. Repository read

- [x] 1.1 Add `RotationsRepository.findAssignedToPilot(pilotId: string, statuses: RotationStatus[]): Promise<Rotation[]>` issuing `where: { pilotId, status: { in: statuses } }` with the shared `rotationInclude`, ordered by `createdAt` asc, mapped through the existing `toModel`.

## 2. Query

- [x] 2.1 Add `ListRotationsForUserQuery` (carrying `pilotId`) and its `ListRotationsForUserHandler` under `application/query/`, deriving the `{ ready, in_progress, finished }` status set from `RotationStatus` (exclude only `draft`) and calling the new repository read.
- [x] 2.2 Assign the dispatched query to a `const` before `queryBus.execute(...)` (no inline `new`).

## 3. HTTP action

- [x] 3.1 Add `ListAssignedRotationsAction` under `infra/http/action/` on `@Controller('/api/v1/user')` with `@Get('/me/rotations')`, authenticated (no `@SkipAuth()`, no `@Role`), reading `request.user.sub` as the pilot id and returning `Rotation[]`.
- [x] 3.2 Add Swagger metadata: `@ApiTags('rotation')`, `@ApiBearerAuth('jwt')`, `@ApiOperation` summary, `@ApiOkResponse({ type: Rotation, isArray: true })`, `@ApiUnauthorizedResponse`.

## 4. Module wiring

- [x] 4.1 Register `ListAssignedRotationsAction` in `controllers` and `ListRotationsForUserHandler` in `providers` of `rotations.module.ts`.

## 5. Seed data

- [x] 5.1 Ensure the rotation seed provides, for a known seeded pilot, at least one `ready`, one `in_progress`, one `finished`, and one `draft` rotation, plus a `ready` rotation assigned to a different pilot — all with fixed v4 UUIDs — so the feature can assert the filter statically.

## 6. Functional tests

- [x] 6.1 Add `features/rotation/rotation.my-list.feature`: the seeded pilot's list returns exactly their `ready`/`in_progress`/`finished` rotations (full-body assertion), excludes their `draft` and the other pilot's `ready`.
- [x] 6.2 Cover the defensive actor matrix for this authenticated read: admin `200`, cabin-crew `200`, unauthenticated `401`.

## 7. Status filter

- [x] 7.1 Add an optional `status` to `ListRotationsForUserQuery`; in the handler intersect the requested state with the actionable set (so `draft` yields an empty list) and pass the resulting states to the repository.
- [x] 7.2 Reuse the existing `ListRotationsFilters` DTO in `ListAssignedRotationsAction` (`@Query()`), add `@ApiQuery({ name: 'status', enum: RotationStatus, required: false })`, and pass `filters.status` into the query.
- [x] 7.3 Extend `rotation.my-list.feature`: filter by a state returns only that state, filter by `draft` returns an empty list, filter by an unrecognised state returns `400`.

## 8. Verify

- [x] 8.1 `docker compose exec app npm run lint` and `npm run build` pass.
- [x] 8.2 `docker compose exec app npx cucumber-js features/rotation/rotation.my-list.feature` passes; then confirm the existing `features/rotation/rotation.list.feature` still passes.
