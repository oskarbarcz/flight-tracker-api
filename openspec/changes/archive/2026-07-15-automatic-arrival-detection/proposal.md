## Why

Arrival (landing) is reported manually today: while a flight is `in_cruise`, a crew member
POSTs `report-arrival` to move it to `taxiing_in` and stamp `actual.arrivalTime`. The backend
already polls ADS-B and backs up each flight's path, each airport already carries a boundary
polygon (`Airport.shape`), and each stored position already carries a `groundSpeed` (knots).
That is enough to detect a landing on its own: once an aircraft has entered its destination
airport's boundary and slowed below taxi-in speed, it has arrived. This change turns that
observation into an automatic arrival report, so a flight no longer depends on a manual action
to complete its cruise — and, because on-block detection begins only once a flight is
`taxiing_in`, automating arrival also moves a flight promptly into the window where the rest of
the arrival lifecycle can proceed.

## What Changes

- **Automatic arrival detection.** For a flight in `in_cruise` whose destination airport has a
  boundary shape, the system inspects the stored path on each update; when any recorded
  position is both inside the destination boundary and reports a ground speed below the arrival
  threshold of 50 knots, it reports arrival automatically.
- **Backdated arrival time.** The reported `actual.arrivalTime` is the timestamp (`date`) of the
  earliest position that satisfies both conditions — not when detection ran — so a detection lag
  of up to one polling cycle does not skew the recorded time.
- **`automaticallyDetected` on the arrival event.** `flight.arrival-reported` carries a payload
  `{ automaticallyDetected: boolean }` — `true` for detector-driven arrivals (operations-scoped,
  no actor, visible in the event timeline), `false` for manual ones.
- **Faster backup polling.** The shared `periodicallyBackupFlightPath` cron interval is reduced
  from 10 to 5 minutes, halving arrival- (and takeoff-) detection latency; the interval is not
  codified in any spec requirement.
- **Manual arrival unchanged.** The existing `report-arrival` action keeps working; the arrival
  command is widened to accept an explicit timestamp and an `automaticallyDetected` flag, with
  its current behavior preserved when those are omitted (the HTTP action's two-argument call
  stays valid).

No breaking changes: all additions. Automatic and manual arrival produce the same status
transition (`in_cruise` → `taxiing_in`), the same `actual.arrivalTime` stamp, and the same
`flight.arrival-reported` event, differing only in scope, actor, and the `automaticallyDetected`
flag.

## Capabilities

### New Capabilities

- `automatic-arrival-detection`: boundary-plus-ground-speed detection of arrival from the stored
  flight path while a flight is `in_cruise`, the backdated arrival time, and the once-only /
  `in_cruise`-only guarantees.

### Modified Capabilities

_None (no spec-level change)._ Arrival rides on the existing `in_cruise` backup poll that already
emits `FlightPathWasUpdated` for cruising flights (`findAllTrackable` already covers
`in_cruise`), mirroring automatic takeoff detection. The shared backup cron's interval is reduced
from 10 to 5 minutes, but that interval is not codified in any `flight-live-position-tracking`
requirement, so no delta spec is required.

## Impact

- **`flights` module:** new `@OnEvent(FlightPathWasUpdated)` `DetectArrivalListener` under
  `application/event/internal/` (beside `detect-takeoff.listener.ts`); `ReportArrivalCommand`/
  `ReportArrivalHandler` widened with a nullable `initiatorId`, an `arrivalTime`, and an
  `automaticallyDetected` flag (scope derived from it); the new listener registered in
  `flights.module.ts` providers; `PositionService.periodicallyBackupFlightPath` cron changed
  from `EVERY_10_MINUTES` to `EVERY_5_MINUTES`. The HTTP `ReportArrivalAction` is unchanged.
- **`core` module:** `ArrivalWasReportedEvent` gains a typed `{ automaticallyDetected }` payload
  (new `ArrivalReportedEventPayload`, mirroring `TakeoffReportedEventPayload`); new pure
  `firstArrivalPosition` helper in `src/core/utils/arrival-position.ts`, reusing the existing
  `isPointInsidePolygon` from `perimeter.ts`. No new dependency.
- **Prisma schema:** none — `Airport.shape`, `Flight.positionReports` (with per-position
  `groundSpeed`), and the timesheet JSON already exist.
- **Tests:** Jest unit specs (colocated) cover the arrival-position helper, the detector guard
  chain, and the command scope/payload derivation; the manual `flight.report-arrival.feature`
  event assertion is updated for the new payload. The event trigger itself is not exercised in
  the Cucumber suite (it runs with `SCHEDULER_ENABLED=false`), mirroring automatic takeoff and
  off-block detection.
