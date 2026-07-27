## Context

Rotations move through `draft → ready → in_progress → finished`
(`RotationStatus` in `src/modules/rotations/model/rotation.model.ts`).
Transitions are driven by dedicated commands (`MarkRotationReadyHandler`) and by
the flight lifecycle (`FlightLifecycleListener`: pilot check-in advances a `ready`
rotation to `in_progress`; closing the last leg's flight advances an
`in_progress` rotation to `finished`). Removal is draft-only
(`RemoveRotationHandler` throws `RotationNotDeletableError` for anything else), so
there is currently no way to retire a rotation once it is `ready`.

`rotation.status` is a plain `String` column (`@default("draft")`) — there is no
Postgres enum or check constraint, so a new status value needs no migration.
Every rotation write is Operations-gated (the "Public read, gated write"
requirement); reads are public.

## Goals / Non-Goals

**Goals:**

- Add a terminal `canceled` state and an Operations-only `cancel` action that
  moves a `ready` rotation to `canceled`.
- Keep the transition guard strict: only `ready` may be cancelled.
- Reuse the existing command/action/error patterns (mirror `mark-ready`).

**Non-Goals:**

- Cancelling from `in_progress` (a rotation whose flying has already begun) — out
  of scope; see Open Questions.
- Detaching or mutating flights attached to a cancelled rotation's legs.
- Un-cancelling / reinstating a canceled rotation.
- Any change to the pilot-facing rotation views (none exist in the current tree).

## Decisions

**1. Cancel only from `ready`.** The request is "when marked ready, can be
manually canceled". `draft` rotations are removed (deleted), not cancelled;
`in_progress`/`finished` are past the point of cancellation; re-cancelling a
`canceled` rotation is a no-op conflict. The handler loads the rotation, throws
`RotationNotFoundError` if missing, throws `RotationNotCancelableError`
(`ConflictError` → 409) unless `status === ready`, then `updateStatus(id,
Canceled, actorId)` — structurally identical to `MarkRotationReadyHandler`.
_Alternative considered:_ also allow `in_progress`. Rejected for now — it raises
questions about in-flight flights and check-in state that the request does not
cover.

**2. New terminal state, no listener changes.** `FlightLifecycleListener` already
guards each transition on the source state (`=== Ready` for check-in, `===
InProgress` for close). A `canceled` rotation therefore never advances, even if a
flight still attached to one of its legs later checks in or closes — so no
listener change and no flight cascade is required. This is verified by an explicit
spec scenario.

**3. `canceled` added to `RotationStatus`.** This automatically makes `canceled`
a valid value of the operator list's `status` filter (`ListRotationsFilters`
validates against the enum) — additive and desirable. The only fallout is the
`@IsEnum` validation message, which now lists five states; the one feature
assertion pinning that message (`rotation.list.feature`) is updated.

**4. Action shape mirrors `mark-ready`:** `POST /api/v1/rotation/:rotationId/cancel`,
`@Role(UserRole.Operations)`, `@HttpCode(200)`, dispatch `CancelRotationCommand`
then read back via `GetRotationByIdQuery` and return the `Rotation`. Consistent
with the other single-transition endpoints.

## Risks / Trade-offs

- **[Attached flights outlive the rotation]** Cancelling leaves any `created`
  flights attached to the rotation's legs in place. → Acceptable: those flights
  remain independently valid, and the inert `canceled` rotation cannot be advanced
  by them. Detaching-on-cancel can be added later if a need appears.
- **[Enum-message coupling in tests]** Pinning the exact validation string is
  brittle. → Not introduced here; the existing assertion is simply updated to the
  new five-value message.

## Open Questions

- Should `in_progress` rotations also be cancellable (e.g. an operational
  disruption mid-rotation)? Assumed **no** for this change; revisit if operations
  needs to abort a rotation already under way.
