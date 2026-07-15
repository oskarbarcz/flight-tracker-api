## 1. Ground-speed helper (core)

- [x] 1.1 Add `firstMovingPosition<T extends { groundSpeed?: number }>(path: T[], thresholdKnots: number): T | null` to a new `src/core/utils/ground-speed.ts`, returning the first element whose `groundSpeed` is defined and strictly greater than the threshold (path assumed sorted ascending by date).
- [x] 1.2 Add colocated `src/core/utils/ground-speed.spec.ts`: returns the first above-threshold element; returns `null` when all elements are at/below the threshold; ignores elements with `undefined` groundSpeed; picks the chronologically earliest qualifying element.

## 2. Widen the off-block command and event

- [x] 2.1 In `src/modules/flights/application/command/report-off-block.command.ts`, widen `ReportOffBlockCommand` to `(flightId, initiatorId: string | null = null, offBlockTime: Date = new Date(), automaticallyDetected: boolean = false)`, mirroring `ReportTakeoffCommand`.
- [x] 2.2 In `ReportOffBlockHandler`, derive `scope = automaticallyDetected ? FlightEventScope.Operations : FlightEventScope.User`, stamp `timesheet.actual.offBlockTime = offBlockTime` (keep the other `actual.*` fields reset to `null`), and emit `OffBlockWasReportedEvent` with `payload: { automaticallyDetected }`.
- [x] 2.3 In `src/core/domain/events/dto/flight.events.ts`, add `OffBlockReportedEventPayload = AircraftFlightEventPayload & { payload: { automaticallyDetected: boolean } }` and change `OffBlockWasReportedEvent extends FlightLifecycleEvent<OffBlockReportedEventPayload>`.
- [x] 2.4 Confirm `OffBlockDelayListener` still compiles/behaves (it reads `flight.timesheet.actual.offBlockTime`, not the payload) — no change expected.
- [x] 2.5 Add a colocated handler spec covering scope/payload derivation: automatic → operations scope, no actor, `{ automaticallyDetected: true }`, `offBlockTime` used as passed; manual → user scope, crew actor, `{ automaticallyDetected: false }`.

## 3. Off-block detector listener

- [x] 3.1 Create `src/modules/flights/application/event/internal/detect-off-block.listener.ts`: `@OnEvent(FlightEventType.FlightPathWasUpdated)`; load flight via `GetFlightQuery`; return unless `status === FlightStatus.BoardingFinished`; read `getFlightPath`; `firstMovingPosition(path, OFF_BLOCK_GROUND_SPEED_THRESHOLD_KNOTS)`; if found dispatch `new ReportOffBlockCommand(flightId, null, firstMoving.date, true)` and log.
- [x] 3.2 Define the `OFF_BLOCK_GROUND_SPEED_THRESHOLD_KNOTS = 3` constant used by the listener.
- [x] 3.3 Add colocated `detect-off-block.listener.spec.ts` (mirror `detect-takeoff.listener.spec.ts`): dispatches `ReportOffBlockCommand(flightId, null, firstMoving.date, true)` when a boarding-finished flight has an above-threshold position; no-op when status is not `boarding_finished`; no-op (and no `getFlightPath` call gate as appropriate) when no position exceeds the threshold.
- [x] 3.4 Register `DetectOffBlockListener` in the `providers` array of `src/modules/flights/flights.module.ts`, beside `DetectTakeoffListener`.

## 4. Continuous boarding-finished polling

- [x] 4.1 Add `findAwaitingOffBlock(): Promise<FlightIdAndCallsign[]>` to `src/modules/flights/infra/database/repository/flights.repository.ts` — `where: { status: FlightStatus.BoardingFinished, isPathAvailable: true }`, `select: flightIdAndCallsign`.
- [x] 4.2 Add `@Cron(CronExpression.EVERY_MINUTE) trackFlightsAwaitingOffBlock()` to `src/modules/flights/infra/service/position.service.ts` that iterates `findAwaitingOffBlock()` and calls the existing `trackFirstPosition` (which emits `FlightPathWasUpdated`).
- [x] 4.3 Confirm `findAwaitingFirstPosition()` is left unchanged (still `boarding_finished AND isPathAvailable: false`) so the two polls stay disjoint and first-receipt behaviour is preserved.

## 5. Functional test alignment

- [x] 5.1 In `features/flight/actions/flight.report-off-block.feature`, update the manual `flight.off-block-reported` event assertion payload from `{}` to `{ "automaticallyDetected": false }` (the happy-path scenario's `/events` body).

## 6. Verify

- [x] 6.1 `docker compose exec app npm run lint` and `format:fix`.
- [x] 6.2 `docker compose exec app npm run build`.
- [x] 6.3 `docker compose exec app npm test` (Jest unit specs: ground-speed helper, detector, handler).
- [x] 6.4 `docker compose exec app npx cucumber-js features/flight/actions/flight.report-off-block.feature` to confirm the manual flow and the updated payload assertion pass.
- [x] 6.5 `openspec validate automatic-offblock-detection --strict`.
