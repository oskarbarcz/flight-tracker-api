## Context

Arrival already exists as a first-class lifecycle event: `ReportArrivalHandler` guards
`in_cruise`, stamps `timesheet.actual.arrivalTime = now`, transitions to `taxiing_in`, and
emits `ArrivalWasReportedEvent` (scope `User`). It is triggered manually via
`POST /api/v1/flight/:id/report-arrival` (`@Role(CabinCrew)`).

The three ingredients needed for automation are already present:

- **The boundary.** Every airport carries an optional boundary polygon (`Airport.shape`,
  a `Coordinates[]` ring), already selected by the flight query and exposed on
  `flight.airports[].shape`. The point-in-polygon test lives in `src/core/utils/perimeter.ts`
  (`isPointInsidePolygon`), already used by automatic takeoff detection.
- **The path with speed.** `PositionService` polls ADS-B and appends to
  `Flight.positionReports` (JSON) via `FlightsRepository.updateFlightPath`, then always emits
  `FlightPathWasUpdated`. `deduplicatePositionReports` sorts the stored path ascending by
  `date`, so "the earliest qualifying position" is well-defined. Each `FlightPathElement`
  already carries an optional `groundSpeed` (knots), mapped straight from the ADS-B feed.
- **The pattern.** Automatic takeoff detection (already shipped) is a
  `@OnEvent(FlightPathWasUpdated)` `DetectTakeoffListener` that loads the flight, guards on
  status, finds the departure airport shape, reads the sorted path, and dispatches a widened
  `ReportTakeoffCommand`. Arrival detection is the direct analogue one status later, against
  the destination boundary rather than the departure boundary, with an added speed condition.

Crucially, cruising flights are **already polled**: `periodicallyBackupFlightPath` (the backup
cron) selects `findAllTrackable()`, which covers `taxiing_out`, `in_cruise`, and `taxiing_in`,
and it calls the same `trackFirstPosition` worker that emits `FlightPathWasUpdated`. So an
`in_cruise` flight already produces a `FlightPathWasUpdated` on every backup cycle with no new
cron — exactly the coverage automatic takeoff detection relies on for `taxiing_out`. This is the
key difference from automatic off-block detection, which had to add a dedicated cron because
boarding-finished flights had dropped out of polling entirely. This change reduces that backup
cron's interval from 10 to 5 minutes so arrival (and takeoff) detection latency is halved.

What is missing: (a) a per-update detector for the destination boundary plus arrival speed, and
(b) a way to report arrival with a chosen timestamp under system attribution.

## Goals / Non-Goals

**Goals:**

- Report arrival automatically for an `in_cruise` flight when its stored path shows a position
  that is both inside the destination airport boundary and below 50 knots ground speed, using
  the timestamp of the earliest such position.
- Reuse the existing arrival mechanism (status transition, timesheet stamp, event) so manual
  and automatic arrival are behaviourally identical.
- Keep the manual `report-arrival` action and its behaviour unchanged.
- Reuse the existing `in_cruise` backup poll (reducing its interval from 10 to 5 minutes); add
  no new cron or repository query.

**Non-Goals:**

- Touchdown-precise arrival timing. Detection fires at the first position that is both inside
  the boundary and below 50 knots (a decelerated taxi-in speed), which trails the actual
  touchdown by the deceleration roll; this is the chosen, robust definition.
- Altitude/`isOnGround`/`verticalRate`-based inference. Detection is purely
  boundary-plus-ground-speed.
- Detecting arrival at a diversion airport. Detection is gated on the planned **destination**
  boundary; a diverted flight that never enters that boundary falls back to manual arrival.
- Tuning the 50-knot threshold per aircraft/airport; it is a single constant.
- Functional (Cucumber) coverage of the event trigger (see Risks), mirroring automatic takeoff
  and off-block detection.
- Backfilling arrival for flights already past `in_cruise`.

## Decisions

### Reuse and widen `ReportArrivalCommand` rather than add a separate command

`ReportArrivalCommand` becomes
`(flightId, initiatorId: string | null = null, arrivalTime: Date = new Date(), automaticallyDetected = false)`,
mirroring the widening already applied to `ReportTakeoffCommand`. The command expresses intent
(automatic or manual); the handler derives the event scope and stamps `arrivalTime` (defaulting
to `new Date()`). Manual callers pass nothing new and keep today's behaviour — in particular the
HTTP action's `new ReportArrivalCommand(id, request.user.sub)` call stays valid because the two
new arguments default. The detector passes the first-qualifying-position timestamp,
`initiatorId = null`, and `automaticallyDetected = true`. The handler's existing `in_cruise`
guard makes repeated dispatches idempotent — the second attempt throws
`InvalidStatusToReportArrivedError` and no-ops.

_Alternative considered:_ a dedicated `RegisterDetectedArrivalCommand`. Rejected to avoid
duplicating the status/timesheet/event write logic across two handlers.

### The arrival event carries `{ automaticallyDetected }` and stays visible in the timeline

`ArrivalWasReportedEvent` gains a typed payload `{ automaticallyDetected: boolean }` via a new
`ArrivalReportedEventPayload = FlightEventPayload & { payload: { automaticallyDetected } }`,
identical in shape to `TakeoffReportedEventPayload`. The handler derives scope from intent:
manual → `user` (with the crew actor), automatic → `operations` (no actor). Both scopes are
persisted (by the existing `@OnEvent(ArrivalWasReported)` handler in `events.repository.ts`) and
broadcast, and both appear in `GET /flight/:id/events`, so automatic arrivals remain visible;
the payload flag is the discriminator. This is the exact shape adopted for takeoff and off-block.

Seeded arrival events in the fixtures are unaffected: they store `payload: {}` and their
feature assertions stay `{}` (the same treatment takeoff and off-block seeded events already
received). Only the runtime-triggered arrival in the manual happy path emits the new payload.

### Trigger via the existing `FlightPathWasUpdated` event, reusing the current polling

A new `@OnEvent(FlightPathWasUpdated)` `DetectArrivalListener` lives in
`flights/application/event/internal/`, beside `detect-takeoff.listener.ts`. The event already
fires on every path backup, including the backup poll that already covers `in_cruise` flights;
the listener filters cheaply:

1. Load the flight (`GetFlightQuery`).
2. `status !== in_cruise` → return. This single guard enforces both "only after takeoff" and
   idempotency once the flight is `taxiing_in`.
3. Find the destination airport (`airports.find(a => a.type === Destination)`); no shape →
   return.
4. Read the sorted path (`getFlightPath`); find the earliest position that is inside the
   destination shape and below the arrival speed (`firstArrivalPosition`).
5. None → return. Otherwise dispatch the widened `ReportArrivalCommand` with that position's
   `date`, `initiatorId = null`, `automaticallyDetected = true`, and log.

No new cron and no new repository query are introduced, because `in_cruise` flights already
receive `FlightPathWasUpdated` from `periodicallyBackupFlightPath` / `findAllTrackable`; only
that cron's interval is reduced (10 → 5 minutes). This is the same coverage automatic takeoff
detection relies on for `taxiing_out`, so there is a single `FlightPathWasUpdated` emission per
flight per backup cycle — no double-poll race like the one off-block detection had to design
around.

_Alternatives considered:_ (a) a dedicated every-minute `findAwaitingArrival()` poll for
`in_cruise` flights, mirroring off-block's `findAwaitingOffBlock`. Rejected: it re-queries and
re-fetches paths that the existing backup already covers; halving the shared backup interval to
5 minutes gets most of the latency benefit for a status flip whose recorded time is backdated
regardless, without adding a second per-minute poll. (b) Inline detection inside the polling
cron — couples detection to polling internals. The event keeps the detector decoupled and
identical in shape to takeoff detection.

### Arrival-position test as a pure helper in `src/core/utils/`

New `firstArrivalPosition<T extends Point & { groundSpeed?: number }>(path, perimeter, maxGroundSpeedKnots): T | null`
in `src/core/utils/arrival-position.ts`, reusing `isPointInsidePolygon` from `perimeter.ts`. It
returns the first element (path already sorted ascending by `date`) whose `groundSpeed` is
defined and strictly below the threshold **and** which lies inside the perimeter, evaluating the
cheap ground-speed check before the ray-cast. Generic over the element type (like
`firstPositionOutsidePerimeter` and `firstMovingPosition`) so `core` does not import a `flights`
model. The 50-knot threshold is a named constant `ARRIVAL_GROUND_SPEED_THRESHOLD_KNOTS` at the
listener.

Both conditions are evaluated on the **same** position rather than independently, because "first
position inside the boundary" alone lands on the high-speed approach fix (~140 kt), and "first
position below 50 kt" alone could in principle match an anomalous slow reading elsewhere. Their
conjunction on one position is what uniquely identifies a completed landing at the destination:
an `in_cruise` aircraft is fast everywhere except after touchdown-and-decelerate, and it is
inside the destination polygon only at the destination.

### Detected time is "first inside-and-slowed", accepted as the arrival time

Per the capability, the first qualifying position's timestamp _is_ the reported arrival time —
the moment the aircraft had both entered the destination boundary and slowed to taxi-in speed.
The flight-event log's `createdAt` reflects detection time; the true arrival time lives in
`timesheet.actual.arrivalTime`.

## Risks / Trade-offs

- **Ground speed is optional in the ADS-B feed** → where a feed never reports `groundSpeed`,
  detection silently never fires and the flight falls back to manual arrival. Mitigation:
  documented as expected gating (a positions-without-ground-speed scenario in the spec); no hard
  failure. Manual arrival always remains available.
- **Detection latency up to one backup cycle (~5 min)** → acceptable and identical to automatic
  takeoff detection; the recorded time is backdated to the first qualifying position, so only the
  status flip is (briefly) late, not the timesheet. If tighter latency is later wanted, a
  dedicated `in_cruise` poll can be added without changing this design.
- **Halving the backup cron doubles ADS-B polling for all trackable flights** (`taxiing_out`,
  `in_cruise`, `taxiing_in`) → modest and bounded; 5 minutes is already the cadence used by the
  weather-refresh and delay-auto-approval crons, so it is an accepted interval in this codebase.
- **Diversions** → a flight that lands somewhere other than its planned destination never enters
  the destination boundary, so auto-detection does not fire and arrival is reported manually.
  Explicitly a non-goal for this change.
- **Threshold too high/low** → 50 knots is comfortably above taxi-in speed and well below
  approach/landing-roll speed, so the conjunction with "inside the boundary" is unambiguous. The
  helper is unit-tested at, below, and above the boundary. It is a single constant, tunable later.
- **Event fires on every path update, including pre-arrival backups** → the listener's
  `in_cruise` guard makes all non-applicable updates cheap no-ops.

## Migration Plan

Additive, no schema change (`Airport.shape`, `Flight.positionReports` with `groundSpeed`, and the
timesheet JSON already exist). Ships active for any flight whose destination has a boundary and
whose ADS-B feed reports ground speed; disabled by absence of either, falling back to manual
arrival. Rollback is removing the listener and the helper; the widened command reverts to its
current behaviour when the new arguments are unused. Because it runs under `SCHEDULER_ENABLED`,
it is inert in the functional test environment.

## Open Questions

- None blocking. Whether 50 knots is the right long-term threshold, and whether `in_cruise`
  warrants a dedicated poll faster than the shared 5-minute backup, can both be tuned later
  without changing the design.
