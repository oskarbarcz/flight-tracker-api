## Context

See proposal.md § Why for the motivation.

Three rotation commands currently gate on the attached flight's state, and they
do not agree on where the line sits:

| Command                      | Guard                                      | Error                                                                                               |
| ---------------------------- | ------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| `AttachFlightToLegHandler`   | `status === Created`                       | `FlightNotAttachableError` (422), message `Only a created flight can be attached to a leg.`         |
| `DetachFlightFromLegHandler` | `status === Created`                       | `LegLockedError` (409), message `Leg cannot be modified because its flight has already checked in.` |
| `UpdateLegHandler`           | `status === Created \|\| status === Ready` | `LegLockedError` (409)                                                                              |

`UpdateLegHandler` is the one that already encodes the intended rule, and
`LegLockedError`'s message already claims the check-in boundary that detach does
not actually enforce. `FlightStatus` is a forward-only ordered lifecycle
(`created → ready → checked_in → … → closed`), and the rotation only reacts to
`PilotCheckedIn` and `FlightWasClosed` events — it never reads flight state
except through these guards. Rotation-level gating (`ready` or `in_progress`)
sits ahead of the flight-state check in both handlers and is untouched here.

## Goals / Non-Goals

**Goals:**

- Land one shared notion of "the flight is still pre-check-in" that attach,
  detach, and leg-retiming all read from, so the three cannot drift again.
- Keep both endpoints' status codes stable: attach still rejects with 422,
  detach still rejects with 409.

**Non-Goals:**

- Changing which rotation states permit attach/detach (`ready` / `in_progress`).
- Touching the event-driven rotation lifecycle, or making attachment itself
  advance a rotation.
- Reworking `UpdateLegHandler` beyond pointing it at the shared predicate.
- Any relaxation past check-in (`boarding_started` and beyond stay rejected).

## Decisions

**Extract the predicate into `model/rotation.rules.ts` rather than repeating the
two-term comparison in each handler.** The file already hosts the module's
domain rules (`assertLegValid`, `assertChainContinuous`), so a
`isFlightPreCheckIn(status: FlightStatus): boolean` — or the assertion-shaped
equivalent — belongs beside them. Alternatives: (a) duplicate
`status !== Created && status !== Ready` in all three handlers, which is exactly
the drift that produced the current inconsistency; (b) expose a helper from the
`flights` module, which would make `rotations` depend on flight internals for
something that is a rotation-side policy — the flights module has no opinion
about attachability. The predicate takes `FlightStatus` (already imported
cross-module by all three handlers today), so no new coupling appears.

**Keep the two distinct error types instead of unifying on one.** Attach's 422
`FlightNotAttachableError` reads "the flight you named is not eligible" —
argument-level, consistent with the route/number/operator rejections beside it.
Detach's 409 `LegLockedError` reads "the leg has moved past the point where this
is allowed" — state-level. Collapsing them would change the status code on one
of the two endpoints, breaking clients for no gain.

**Reword the attach message to name the rule, not the single allowed state.**
`Only a created flight can be attached to a leg.` becomes a check-in-framed
message such as `Only a flight that has not checked in yet can be attached to a
leg.` The message is asserted verbatim in the feature suite, so this is a
deliberate, tested change rather than incidental drift. Leaving it as-is would
have the API tell operators something false.

**Leave `LegLockedError`'s message untouched.** It already says "its flight has
already checked in", which becomes true of detach for the first time under this
change.

## Risks / Trade-offs

**A `ready` flight carries more state than a `created` one — a filed OFP, an
assigned aircraft, possibly crew — and attaching it retroactively binds that
state to a rotation leg.** → The attachment predicates already assert the only
things the rotation cares about: route, flight number, and operator. The leg's
planned times are advisory (`UpdateLegHandler` lets Operations retime a leg with
a `ready` flight attached), so a `ready` flight whose real schedule has drifted
from the plan is a pre-existing, already-supported situation rather than
something this change introduces.

**Attaching a `ready` flight leaves the rotation eligible for exactly one
lifecycle nudge — the pilot's check-in — with no preceding `created → ready`
transition to observe.** → No mitigation needed: `FlightLifecycleListener`
listens only for `PilotCheckedIn` and `FlightWasClosed` and never observed the
`created → ready` step in the first place, so the advance to `in_progress` fires
identically.

**Widening detach means a mistaken attachment can now be undone later in the
flight's life, including after an OFP is filed.** → Accepted, and the point of
including detach: without it, attaching a `ready` flight would be irreversible.
The action stays Operations-gated and audit-stamped via `setLegFlight`.

## Migration Plan

Behavioural relaxation only — no schema change, no migration, no data backfill.
Every attachment valid before the change stays valid after it, so the change is
backward-compatible for existing clients; the sole client-visible difference on
the previously-rejecting path is the reworded 422 message. Rollback is reverting
the two guards.
