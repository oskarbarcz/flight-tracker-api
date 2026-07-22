## Context

Flight rotation is implemented across three modules rather than a dedicated one:

- **`operators`** owns the `Rotation` entity CRUD (5 actions, repository, 5 command/query handlers, an `AssertRotationExistsQuery` cross-module contract, model, request DTOs, error).
- **`flights`** owns flight↔rotation assignment (`AddFlightToRotationCommand`, `RemoveFlightFromRotationCommand`, `GetLastFlightInRotationQuery`, 2 actions, repository methods) and threads `rotationId` through every flight lifecycle event payload.
- **`users`** consumes rotation via `flight-lifecycle.listener.ts`, maintaining `User.currentRotation` on pilot check-in and flight close through `GetLastFlightInRotationQuery`.

The Prisma schema has a `Rotation` model with relations from `Flight` (`rotationId`), `User` (`currentRotationId` + unique index, plus `rotations` back-relation) and `Operator` (`rotations`). Rotation is not captured in any active `openspec/specs/` capability, so its removal changes no documented requirement — the delta spec records the retired behavior only.

The whole feature is being reimplemented differently; the user has confirmed all existing rotation code can be removed now.

## Goals / Non-Goals

**Goals:**

- Remove every rotation touchpoint: source files, DI registrations, Prisma model + relations, event contract, seed data, tests, and docs.
- Leave the codebase compiling, linting, and passing the functional + unit suites with no dangling references.
- Drop the database objects cleanly via a new migration so a fresh `prisma migrate deploy` and `db push` both succeed.

**Non-Goals:**

- Designing or stubbing the new rotation feature — that is a separate future change.
- Preserving or migrating existing rotation data (it is discarded).
- Refactoring unrelated flight lifecycle behavior beyond dropping the `rotationId` field from event payloads.

## Decisions

**Decision: Delete rotation files outright rather than deprecate.**
The feature is being fully retired, so soft-deprecation adds no value. All files listed in the removal inventory are deleted, and their entries removed from `operators.module.ts` and `flights.module.ts` `controllers`/`providers` arrays (handlers and actions are not auto-discovered, so both the import and the array entry must go).

**Decision: Drop `rotationId` from the shared flight event payload, not just null it.**
`FlightEventPayload.rotationId` is threaded through ~23 lifecycle commands plus `off-block-delay.listener.ts` and `position.service.ts`. Rather than leave a permanently-null field, remove the field from the payload type and delete every `rotationId: ...` assignment. This keeps the event contract honest and avoids a vestigial field the new feature would have to reason about. Alternative considered: keep the field nullable and stop populating it — rejected because it leaves dead surface area in a cross-module contract.

**Decision: Remove the two rotation domain events and their subscribers.**
`FlightWasAddedToRotation` / `FlightWasRemovedFromRotation` enum members and event classes are deleted, along with the three `@OnEvent` subscriptions in the flights module (`events.repository`, `broadcast-flight-event.listener`, `flight-cache.listener`). The `users` lifecycle listener loses its rotation branches (check-in set, close clear) and its `GetLastFlightInRotationQuery` import.

**Decision: One new Prisma migration drops all rotation DB objects.**
Add a migration that drops FKs (`flight_rotationId_fkey`, `rotation_pilotId_fkey`, `rotation_operatorId_fkey`, `user_currentRotationId_fkey`), the unique index `user_currentRotationId_key`, the columns `flight.rotationId` and `user.currentRotationId`, and the `rotation` table. Remove the `Rotation` model and all relation fields from `schema.prisma` so the generated client (`prisma/client/`) no longer emits `Rotation` types. Per project practice, apply to the dev DB with `prisma db push` (migrate deploy P3005-fails on the existing DB); the migration file exists for fresh deploys. Alternative considered: leave columns in place — rejected because dangling FK columns and a `Rotation` model with no code is exactly the clutter this change removes.

**Decision: Delete dedicated rotation features; edit shared feature/unit fixtures.**
The 7 rotation-only Cucumber features are deleted. The ~25 remaining flight/user feature files and 6 unit-test spec fixtures that assert `rotationId`/`rotation`/`currentRotationId` are edited to drop those keys (full-body assertions must match exact keys, per the deep-compare contract). Scenarios that exist only to exercise the rotation flow (e.g. "check-in that starts rotation", "close last flight in rotation") are removed rather than retained without their assertions.

## Risks / Trade-offs

- **Full-body assertion mismatches** → The Cucumber deep-compare matches exact key sets, so any missed `rotationId`/`rotation`/`currentRotationId` key breaks a scenario. Mitigation: statically reconcile every edited feature against the new payloads before running the suite (align tests and seed first), then run the functional suite.
- **Generated Prisma client drift** → `prisma/client/` files still reference `Rotation` until regenerated. Mitigation: run `prisma generate` after editing the schema; do not hand-edit generated files.
- **Missed DI entry leaves a broken module** → Removing an import but not its `providers`/`controllers` array entry (or vice versa) fails to compile. Mitigation: build inside the container after edits; treat a clean `npm run build` as the gate.
- **Dead repository method** → `flights.repository.ts:getRotationIdByFlightId()` has no callers; delete it with the rest to avoid leaving orphaned rotation code.
- **Breaking API change** → Consumers of the removed endpoints/fields break. Accepted: the feature is being retired deliberately and the replacement is out of scope here.

## Migration Plan

1. Edit `schema.prisma` (drop model + relations), add the drop migration, run `prisma generate` + `prisma db push` in the container.
2. Delete rotation source files and remove their DI registrations.
3. Strip `rotationId` from the event payload type and all producers; remove the two events and their subscribers; rewrite the users lifecycle listener.
4. Remove rotation seed data and update user/flight seed fixtures.
5. Delete rotation features; edit remaining feature files and unit fixtures.
6. Update `CLAUDE.md`, `README.md`, Swagger description.
7. Build, lint, run unit + functional suites.

Rollback: revert the branch; no data migration to reverse (rotation data is discarded on the forward migration only).

## Open Questions

None — the user has confirmed all rotation code can be removed now, and the replacement design is out of scope for this change.
