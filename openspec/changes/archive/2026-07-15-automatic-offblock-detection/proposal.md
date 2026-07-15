## Why

Off-block is reported manually today: while a flight is `boarding_finished`, a crew member
POSTs `report-off-block` to move it to `taxiing_out` and stamp `actual.offBlockTime`. The
backend already polls ADS-B and stores each flight's path, and each stored position already
carries a `groundSpeed` (knots). That is enough to detect pushback on its own: once a
boarding-finished aircraft starts rolling, its ground speed rises above a walking pace. This
change turns that observation into an automatic off-block report, so a flight no longer
depends on a manual action to leave the gate — and, because takeoff detection only starts
once a flight is `taxiing_out`, automating off-block also unblocks the existing automatic
takeoff detection without crew input.

## What Changes

- **Automatic off-block detection.** For a flight in `boarding_finished`, the system inspects
  the stored path on each update; when any recorded position reports a ground speed above
  3 knots, it reports off-block automatically.
- **Backdated off-block time.** The reported `actual.offBlockTime` is the timestamp (`date`)
  of the earliest position whose ground speed exceeds the threshold — not when detection ran
  — so a detection lag of up to one polling cycle does not skew the recorded time.
- **Continuous pre-off-block polling.** Boarding-finished flights are polled once per minute
  even after their first position has been stored, so the ground-speed rise at pushback is
  observed. Today a boarding-finished flight drops out of polling as soon as its first
  position arrives.
- **`automaticallyDetected` on the off-block event.** `flight.off-block-reported` carries a
  payload `{ automaticallyDetected: boolean }` — `true` for detector-driven off-blocks
  (operations-scoped, no actor, visible in the event timeline), `false` for manual ones.
- **Manual off-block unchanged.** The existing `report-off-block` action keeps working; the
  off-block command is widened to accept an explicit timestamp and an `automaticallyDetected`
  flag, with its current behavior preserved when those are omitted.

No breaking changes: all additions. Automatic and manual off-block produce the same status
transition, timesheet stamp, `flight.off-block-reported` event, and downstream delay
evaluation, differing only in scope, actor, and the `automaticallyDetected` flag.

## Capabilities

### New Capabilities

- `automatic-offblock-detection`: ground-speed-based detection of off-block from the stored
  flight path while a flight is `boarding_finished`, the backdated off-block time, and the
  once-only / `boarding_finished`-only guarantees.

### Modified Capabilities

- `flight-live-position-tracking`: boarding-finished flights are polled continuously (once
  per minute) until they report off-block, rather than only until their first stored
  position, so ground-speed changes are observed and `FlightPathWasUpdated` keeps firing.

## Impact

- **`flights` module:** new `@OnEvent(FlightPathWasUpdated)` `DetectOffBlockListener` under
  `application/event/internal/` (beside `detect-takeoff.listener.ts`); `PositionService`
  gains an every-minute cron polling boarding-finished flights that already have a path;
  `FlightsRepository` gains `findAwaitingOffBlock()`; `ReportOffBlockCommand`/`ReportOffBlockHandler`
  widened with a nullable `initiatorId`, an `offBlockTime`, and an `automaticallyDetected` flag
  (scope derived from it); `OffBlockWasReportedEvent` gains a typed `{ automaticallyDetected }`
  payload.
- **`core` module:** new pure `firstMovingPosition` helper in `src/core/utils/ground-speed.ts`
  beside `perimeter.ts`. No new dependency.
- **Prisma schema:** none — `Flight.positionReports` (with per-position `groundSpeed`),
  `isPathAvailable`, and the timesheet JSON already exist.
- **Tests:** Jest unit specs (colocated) cover the ground-speed helper, the detector guard
  chain, and the command scope/payload derivation; the manual `report-off-block.feature`
  event assertion is updated for the new payload. The cron/event trigger itself is not
  exercised in the Cucumber suite (it runs with `SCHEDULER_ENABLED=false`), mirroring
  automatic takeoff detection and `DelayAutoApprovalService`.
