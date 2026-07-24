## Context

A previous rotation feature was removed (see `2026-07-22-remove-flight-rotation`) because it modelled a rotation as a flat bag of already-existing flights and threaded `rotationId` through every flight lifecycle event, spreading the feature across the `operators`, `flights`, and `users` modules. This change reintroduces rotations with a different center of gravity: the unit of planning is a **leg/plan** (an intent to fly a sector) that exists before any flight does, and a real flight is attached to it later.

Relevant existing building blocks this design reuses:

- Flight domain events already exist: `flight.pilot-checked-in` (`FlightEventType.PilotCheckedIn`) and `flight.closed` (`FlightEventType.FlightWasClosed`).
- The `users` module already contains `application/event/external/flight-lifecycle.listener.ts`, an established precedent for a module reacting to flight lifecycle events without the flight knowing about the consumer.
- Cross-module flight reads are available through `GetFlightQuery` on the `QueryBus`.
- `FlightStatus.Created` is the initial flight status; attachment keys off it.

## Goals / Non-Goals

**Goals:**

- Model a rotation as an operator-scoped, pilot-assigned aggregate whose legs are the plans.
- Let operations plan the whole day up front (legs exist before flights), then attach flights per leg as the day unfolds.
- Keep the `flights` module completely unaware of rotations — dependency flows one way (`rotations → flights`).
- Drive rotation lifecycle transitions from existing flight domain events, not from flight code calling into rotations.
- Expose rotations publicly for a map, while gating all writes to Operations.

**Non-Goals:**

- Diversions (a flight landing somewhere other than the leg's planned arrival).
- Cancellation of a rotation, and any `cancelled` state.
- Reacting to a flight being deleted/cancelled at the flight level while attached.
- Un-readying a rotation (`ready → draft`) or any backward transition.
- Duty-time / regulatory computations beyond per-leg block time.

## Decisions

### Leg is the plan — one table, no separate `plan` entity

A plan cannot exist without a leg and a leg cannot exist without a plan, so they are the same row (`rotation_leg`). The leg holds the committed route and planned times; `blockTime` is computed, never stored. _Alternative considered:_ a standalone `plan` table referenced by legs — rejected because it adds a join and a lifecycle for an entity that has no independent existence.

### No `rotationId` on `flight` — the leg is the sole join

`rotation_leg.flightId` (nullable, unique) is the only link between a rotation and a flight. "Flights in rotation X" is `rotation → legs → flightId`; "rotation of flight Y" is `leg WHERE flightId = Y`. _Alternative considered:_ denormalize `rotationId` onto `flight` for reverse lookups — rejected because it duplicates the relationship (drift risk), and re-introduces exactly the coupling that got the previous feature removed. Reads almost always start from the rotation, so the reverse lookup is not hot.

### Event-driven lifecycle via a rotations-side listener

A `rotations` external listener subscribes to `flight.pilot-checked-in` and `flight.closed`, maps the event's `flightId` to the owning leg, and advances the rotation (`ready → in_progress`, `in_progress → finished`). The listener is **idempotent** — advancing an already-advanced rotation is a no-op. _Alternative considered:_ computing `status` on read from leg flight statuses — rejected because it prevents emitting a real "rotation finished" signal and pushes derivation cost into every read.

### Ordering derived from off-block time

Legs carry no `order` column; sequence is `ORDER BY offBlockTime`. "Last leg" (the finish trigger) is the leg with the maximum planned off-block time. This keeps a single source of truth for ordering and makes retiming automatically reorder.

### Continuity validated at `ready`, per-leg validity always

Per-leg invariants (`departure != arrival`, `offBlock < onBlock`) are enforced on every add/update. Chain invariants (`arrival[N] == departure[N+1]`, `offBlock[N+1] >= onBlock[N]`) are enforced as a precondition of `mark ready` and re-checked on any leg edit while `ready`/`in_progress` — during `draft` the chain is allowed to be incomplete while it is being built. _Alternative considered:_ enforce the chain on every draft edit — rejected because it makes incremental building impossible.

### Attachment validation reads the flight via the bus

Attaching dispatches `GetFlightQuery` and validates: `status == created`, departure/arrival airports equal the leg's plan, `operatorId == rotation.operatorId`, and the flight is not already on a leg (DB unique on `flightId`). No captain check — the rotation's pilot is informational and not cross-validated against the flight's captain.

### Freeze semantics

`ready` freezes only the _set_ of legs and each leg's _airports_. Planned times of any leg without a checked-in flight stay editable in `ready`/`in_progress`. `finished` is fully immutable.

### Module and API shape

New `src/modules/rotations/` following the standard DDD layout, registered in `AppModule`. One controller class per endpoint. Write endpoints `@Role(UserRole.Operations)`; read endpoints `@SkipAuth()`. Rotation is its own domain but is surfaced under the operator in the UI via operator-scoped routes.

## Risks / Trade-offs

- **Diversion breaks the happy path** → A diverted flight still closes, but the next leg's planned departure no longer matches where the aircraft is, so the next attachment would fail validation. Mitigation: explicitly out of scope for v1; operations handle it out-of-band. A later change can allow re-routing not-yet-flown legs (the freeze rule already permits time edits; extending to airports is the natural follow-up).
- **A rotation can get stuck `in_progress`** → If the last-off-block leg never receives a flight (or its flight never closes), the rotation never reaches `finished`. Accepted for v1; no manual finish/cancel exists yet.
- **At-least-once / out-of-order events** → The listener must treat transitions as idempotent guarded state changes (only advance from the expected prior state) to tolerate duplicate or replayed flight events.
- **Attachment assumes SimBrief/manual flights begin in `created`** → If a creation path starts a flight in another status, attachment would reject it. Mitigation: verify the initial status of both creation paths during implementation.
- **Public reads expose draft plans** → Draft rotations become publicly readable. Low impact (a draft has no flights, so it won't surface on the map), but noted as an open question below.

## Migration Plan

- Additive Prisma migration creating `rotation` and `rotation_leg` with the unique constraint on `rotation_leg.flightId` and indexes on `rotationId`/`flightId`. No changes to `flight`, `user`, or `operator`.
- Register the `rotations` module in `AppModule`; add seed fixtures with fixed UUIDs.
- Rollback is clean: drop the two tables and unregister the module — nothing else references them.

## Open Questions

- Should `draft` rotations be excluded from public reads (visible only to Operations until `ready`), or is public-for-all-states acceptable? Current design: public for all states.
- Is a dedicated pilot-facing "my current rotation" endpoint needed, or is operator/pilot-scoped listing sufficient given reads are public?
- Confirm both flight creation paths (manual and SimBrief) yield `FlightStatus.Created` so attachment's `created` precondition holds.
