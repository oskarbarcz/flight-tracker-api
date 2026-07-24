## Context

`rotation-management` already supports create, leg building, mark-ready, flight
attach/detach, and reads, but a rotation's own attributes (name, pilot) were
immutable after creation and rotations could not be deleted. This change adds the
missing edit and remove operations for the still-being-planned (draft) phase, plus a
Swagger regrouping of the leg endpoints.

## Goals / Non-Goals

**Goals:**

- Edit a rotation's name + pilot and remove a rotation, while it is a draft.
- Keep the write surface Operations-gated and consistent with existing rotation actions.
- Group leg endpoints separately from rotation-level endpoints in the API docs.

**Non-Goals:**

- Editing legs (already covered by the leg endpoints).
- Editing/removing a rotation after it is marked ready.
- Changing a rotation's operator (it is fixed at creation, path-scoped).

## Decisions

- **Draft-only, enforced in the command handler.** Both handlers load the rotation,
  404 if missing, then reject unless `status === draft`. "Not marked as ready" is read
  as strictly `draft` — `ready`, `in_progress`, and `finished` are all blocked, mirroring
  the existing leg-freeze rules. _Alternative — allow edits until in-progress:_ rejected;
  the intent is that marking ready commits the plan.
- **`409 Conflict` for the state guard**, via new `RotationNotEditableError` /
  `RotationNotDeletableError`, matching the existing `LegSetFrozenError` "once ready"
  conflict rather than the 422 used for mark-ready validation.
- **Edit returns the rotation** (write-then-read via `GetRotationByIdQuery`), like
  create; **remove returns `204`** (the resource is gone, nothing to return).
- **Leg cascade on remove** relies on the existing `RotationLeg → Rotation`
  `onDelete: Cascade`; draft rotations have no attached flights, so no flight rows are
  affected.
- **Tag split is documentation-only** (`@ApiTags`), no routing/behavior change.

## Risks / Trade-offs

- **Full-body Gherkin assertions on shared seed fixtures** → the mutating scenarios
  (edit success, remove success) end with `I set database to initial state` so later
  features still see the seeded rotations.
