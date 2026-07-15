## Context

Off-block already exists as a first-class lifecycle event: `ReportOffBlockHandler` guards
`boarding_finished`, stamps `timesheet.actual.offBlockTime = now`, transitions to
`taxiing_out`, and emits `OffBlockWasReportedEvent` (scope `User`). It is triggered manually
via `POST /api/v1/flight/:id/report-off-block` (`@Role(CabinCrew)`). A downstream
`OffBlockDelayListener` reacts to that event and opens a delay request when the actual
off-block is late against schedule.

Two ingredients needed for automation are already present:

- **The path.** `PositionService` polls ADS-B and appends to `Flight.positionReports` (JSON)
  via `FlightsRepository.updateFlightPath`, then always emits `FlightPathWasUpdated`.
  `deduplicatePositionReports` sorts the stored path ascending by `date`, so "the earliest
  moving position" is well-defined. Each `FlightPathElement` already carries an optional
  `groundSpeed` (knots), mapped straight from the ADS-B feed.
- **The pattern.** Automatic takeoff detection (already shipped) is a
  `@OnEvent(FlightPathWasUpdated)` `DetectTakeoffListener` that loads the flight, guards on
  status, reads the sorted path, and dispatches a widened `ReportTakeoffCommand`. Off-block
  detection is the direct analogue one step earlier in the lifecycle.

What is missing: (a) a way to keep boarding-finished flights polled so ground speed is
actually observed, (b) a per-update detector, and (c) a way to report off-block with a chosen
timestamp under system attribution.

The one structural gap is polling coverage. Boarding-finished flights are polled by
`detectFirstLivePosition` (every minute) **only while `isPathAvailable === false`**; the
moment the first position lands (`updateFlightPath` sets `isPathAvailable = true`), the flight
drops out of `findAwaitingFirstPosition`, and `findAllTrackable` (the 10-minute backup) covers
only `taxiing_out`/`in_cruise`/`taxiing_in`. So a boarding-finished flight sitting at the gate
with a stored path is never re-polled, and no `FlightPathWasUpdated` fires for it until it
manually leaves the gate — exactly the window in which pushback happens. Ground-speed
detection is impossible without closing this gap.

## Goals / Non-Goals

**Goals:**

- Report off-block automatically for a `boarding_finished` flight when its stored path shows
  ground speed above 3 knots, using the timestamp of the first such position.
- Reuse the existing off-block mechanism (status transition, timesheet stamp, event,
  downstream delay evaluation) so manual and automatic off-block are behaviourally identical.
- Keep the manual `report-off-block` action and its behaviour unchanged.
- Keep boarding-finished flights polled at a one-minute cadence so detection latency stays low
  and automatic takeoff detection (which only starts at `taxiing_out`) is unblocked promptly.

**Non-Goals:**

- Altitude/`isOnGround`-based inference. Detection is purely ground-speed-based.
- Tuning the 3-knot threshold per aircraft/airport; it is a single constant.
- Functional (Cucumber) coverage of the cron/event trigger (see Risks), mirroring automatic
  takeoff detection.
- Backfilling off-block for flights already past `boarding_finished`.

## Decisions

### Reuse and widen `ReportOffBlockCommand` rather than add a separate command

`ReportOffBlockCommand` becomes `(flightId, initiatorId? = null, offBlockTime? = now, automaticallyDetected = false)`,
mirroring the widening already applied to `ReportTakeoffCommand`. The command expresses intent
(automatic or manual); the handler derives the event scope and stamps `offBlockTime`
(defaulting to `new Date()`). Manual callers pass nothing new and keep today's behaviour; the
detector passes the first-movement timestamp, `initiatorId = null`, and
`automaticallyDetected = true`. The handler's existing `boarding_finished` guard makes repeated
dispatches idempotent — the second attempt throws `InvalidStatusToReportOffBlockError` and no-ops.

_Alternative considered:_ a dedicated `RegisterDetectedOffBlockCommand`. Rejected to avoid
duplicating the status/timesheet/event write logic across two handlers.

### The off-block event carries `{ automaticallyDetected }` and stays visible in the timeline

`OffBlockWasReportedEvent` gains a typed payload `{ automaticallyDetected: boolean }` (via a new
`OffBlockReportedEventPayload = AircraftFlightEventPayload & { payload: { automaticallyDetected } }`).
The handler derives scope from intent: manual → `user` (with the crew actor), automatic →
`operations` (no actor). Both scopes are persisted and broadcast and both appear in
`GET /flight/:id/events`, so automatic off-blocks remain visible; the payload flag is the
discriminator. This is the exact shape adopted for takeoff.

`OffBlockDelayListener` reads `actual.offBlockTime` back from the database (not from the event
payload), so the new payload does not affect it. Because the automatic off-block time is
backdated to the first-movement position, the delay it computes is _more_ accurate than the
manual path, which uses detection time.

### Trigger via the existing `FlightPathWasUpdated` event

A new `@OnEvent(FlightPathWasUpdated)` `DetectOffBlockListener` lives in
`flights/application/event/internal/`, beside `detect-takeoff.listener.ts`. The event already
fires on every path backup; the listener filters cheaply:

1. Load the flight (`GetFlightQuery`).
2. `status !== boarding_finished` → return. This single guard enforces both "only before
   off-block" and idempotency once the flight is `taxiing_out`.
3. Read the sorted path (`getFlightPath`); find the earliest position with
   `groundSpeed > 3` (`firstMovingPosition`).
4. None → return. Otherwise dispatch the widened `ReportOffBlockCommand` with that position's
   `date`, `initiatorId = null`, `automaticallyDetected = true`.

_Alternatives considered:_ (a) inline detection inside the polling cron — couples detection to
polling internals; (b) a new cron in the `automations` module — re-queries and re-reads paths
for no benefit over reacting to the update that just happened. The event keeps the detector
decoupled and identical in shape to takeoff detection.

### Close the polling gap with a dedicated, disjoint boarding-finished poll

`PositionService` gains `@Cron(EVERY_MINUTE) trackFlightsAwaitingOffBlock()` backed by a new
`FlightsRepository.findAwaitingOffBlock()` returning flights with `status = boarding_finished`
**and `isPathAvailable = true`**. It reuses `trackFirstPosition`, so it fetches ADS-B, merges
the path, and emits `FlightPathWasUpdated` (feeding the detector).

The `isPathAvailable = true` filter makes this query **disjoint** from
`findAwaitingFirstPosition` (which keeps `boarding_finished AND isPathAvailable = false`):

- Before first fix: `findAwaitingFirstPosition` polls the flight (and still raises the
  once-only `LivePositionReceived`). Ground speed is ~0 at the gate, so no false off-block.
- After first fix: `updateFlightPath` flips `isPathAvailable = true`; the flight leaves
  `findAwaitingFirstPosition` and enters `findAwaitingOffBlock`, which keeps it polled every
  minute until it becomes `taxiing_out`.

Disjointness matters: it prevents two simultaneous `FlightPathWasUpdated` emissions per minute
for the same flight, which would otherwise race two `ReportOffBlockCommand` dispatches (the
loser throwing a spurious 422 inside the event handler). `findAwaitingFirstPosition` is left
untouched, so first-receipt behaviour and its spec are unchanged.

_Alternatives considered:_ (a) add `BoardingFinished` to `findAllTrackable()` (the 10-minute
backup) — minimal, but a status-flip lag of up to ten minutes both misrepresents a taxiing
aircraft as still boarding and delays the downstream takeoff detector by the same amount;
(b) poll all boarding-finished flights regardless of `isPathAvailable` — simpler query but
reintroduces the double-poll race above.

### Ground-speed test as a pure helper in `src/core/utils/`

New `firstMovingPosition<T extends { groundSpeed?: number }>(path, thresholdKnots): T | null`
in `src/core/utils/ground-speed.ts`, beside `perimeter.ts`. It returns the first element whose
`groundSpeed` is defined and strictly greater than the threshold, relying on the path already
being sorted ascending by `date`. Generic over the element type (like
`firstPositionOutsidePerimeter`) so `core` does not import a `flights` model. The 3-knot
threshold is a named constant at the listener.

### Detected time is "first movement", accepted as the off-block time

Per the capability, the first above-threshold position's timestamp _is_ the reported off-block
time — the moment the aircraft began to roll under pushback/taxi power. The flight-event log's
`createdAt` reflects detection time; the true off-block time lives in
`timesheet.actual.offBlockTime`.

## Risks / Trade-offs

- **Ground speed is optional in the ADS-B feed** → where a feed never reports `groundSpeed`,
  detection silently never fires and the flight falls back to manual off-block. Mitigation:
  documented as expected gating (a positions-without-ground-speed scenario in the spec); no
  hard failure. Manual off-block always remains available.
- **A low threshold could trip on GPS jitter while parked** → 3 knots (≈ 5.5 km/h) is above
  positional-noise speeds but below any real taxi speed. The helper is unit-tested at, below,
  and above the boundary.
- **Detection latency up to one poll cycle (~1 min)** → acceptable, and far tighter than the
  10-minute backup alternative; the recorded time is backdated to the first-movement position,
  so only the status flip is (briefly) late, not the timesheet.
- **Event fires on every path update, including pre-off-block backups** → the listener's
  `boarding_finished` guard makes all non-applicable updates cheap no-ops.
- **Extra ADS-B polling for boarding-finished flights** → one request per minute per flight in
  a short-lived window (finished boarding, not yet rolling); negligible and bounded, and it
  also keeps the path warm for the takeoff detector.

## Migration Plan

Additive, no schema change (`groundSpeed`, `isPathAvailable`, and the timesheet JSON already
exist). Ships active for any flight whose ADS-B feed reports ground speed; disabled by absence
of that data, falling back to manual off-block. Rollback is removing the listener, the new cron,
and `findAwaitingOffBlock`; the widened command reverts to its current behaviour when the new
arguments are unused. Because it runs under `SCHEDULER_ENABLED`, it is inert in the functional
test environment.

## Open Questions

- None blocking. Whether 3 knots is the right long-term threshold (vs. e.g. 5) can be tuned
  later without changing the design, since it is a single constant.
