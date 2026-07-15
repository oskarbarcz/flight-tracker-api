## Why

Takeoff is reported manually today: while a flight is `taxiing_out`, a crew member
POSTs `report-takeoff` to move it to `in_cruise` and stamp `actual.takeoffTime`. The
backend already polls ADS-B and stores each flight's path, and airports already carry a
boundary polygon (`Airport.shape`). Those two facts are enough to detect takeoff on their
own: once the recorded path leaves the departure airport's perimeter, the aircraft has
departed. This change turns that observation into an automatic takeoff report, so flights
whose departure airport has a mapped boundary no longer depend on a manual action.

## What Changes

- **Automatic takeoff detection.** For a flight in `taxiing_out` whose departure airport
  has a `shape`, the system inspects the stored path on each update; when the earliest
  recorded position lies outside the perimeter, it reports takeoff automatically.
- **Backdated takeoff time.** The reported `actual.takeoffTime` is the timestamp (`date`)
  of that first out-of-perimeter position — not when detection ran — so a detection lag of
  up to one polling cycle does not skew the recorded time.
- **Feature toggle by geometry.** Departure airport with a `shape` → detection active;
  no `shape` → detection disabled, takeoff reported only via the existing manual action.
- **New path-update signal.** The position-tracking subsystem emits a `FlightPathWasUpdated`
  event on every path backup (distinct from the once-only `LivePositionReceived`), which
  the detector consumes.
- **`automaticallyDetected` on the takeoff event.** `flight.takeoff-reported` carries a
  payload `{ automaticallyDetected: boolean }` — `true` for detector-driven takeoffs
  (operations-scoped, no actor, visible in the event timeline), `false` for manual ones.
- **Manual takeoff unchanged.** The existing `report-takeoff` action keeps working; the
  takeoff command is widened to accept an explicit timestamp and an `automaticallyDetected`
  flag, with its current behavior preserved when those are omitted.

No breaking changes: all additions. Automatic and manual takeoff produce the same status
transition, timesheet stamp, and `flight.takeoff-reported` event, differing only in scope,
actor, and the `automaticallyDetected` flag.

## Capabilities

### New Capabilities

- `automatic-takeoff-detection`: perimeter-based detection of takeoff from the stored
  flight path, its gating by the departure airport boundary, the backdated takeoff time,
  and the once-only/`taxiing_out`-only guarantees.

### Modified Capabilities

- `flight-live-position-tracking`: adds a per-update `FlightPathWasUpdated` signal emitted
  whenever a path backup runs, alongside the existing once-only first-receipt signal.

## Impact

- **`flights` module:** new `@OnEvent(FlightPathWasUpdated)` `DetectTakeoffListener` under
  `application/event/internal/` (beside `off-block-delay.listener.ts`); `PositionService`
  emits the new event after `updateFlightPath`; `ReportTakeoffCommand`/`ReportTakeoffHandler`
  widened with nullable `initiatorId`, `takeoffTime`, and an `automaticallyDetected` flag
  (scope derived from it); `TakeoffWasReportedEvent` gains a typed `{ automaticallyDetected }`
  payload; the new `FlightPathWasUpdated` event is internal-only (not in the persistence /
  broadcast allowlists).
- **`core` module:** new pure `isPointInsidePolygon` / `firstPositionOutsidePerimeter`
  helpers in `src/core/utils/perimeter.ts` beside `distance.ts`. No new dependency.
- **Prisma schema:** none — `Airport.shape`, `Flight.positionReports`, and the timesheet
  JSON already exist.
- **Tests:** Jest unit specs (colocated) cover the geometry, the detector guard chain, and
  the command scope/payload derivation; the manual `report-takeoff.feature` assertion is
  updated for the new payload. The cron/event trigger itself is not exercised in the
  Cucumber suite (it runs with `SCHEDULER_ENABLED=false`), mirroring `DelayAutoApprovalService`.
  Jest is configured via `ts-jest`; `tsconfig.build.json` keeps specs out of `dist`.
