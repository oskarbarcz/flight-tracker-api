## 1. Arrival-position helper (core)

- [x] 1.1 Add `firstArrivalPosition<T extends { latitude: number; longitude: number; groundSpeed?: number }>(path: T[], perimeter: Point[], maxGroundSpeedKnots: number): T | null` to a new `src/core/utils/arrival-position.ts`, reusing `isPointInsidePolygon` from `perimeter.ts`; return the first element whose `groundSpeed` is defined and strictly below the threshold and which lies inside the perimeter (ground-speed checked before the ray-cast; path assumed sorted ascending by date).
- [x] 1.2 Add colocated `src/core/utils/arrival-position.spec.ts`: returns the first position that is inside the perimeter and below the threshold; returns `null` when all inside positions are at/above the threshold; returns `null` when all below-threshold positions are outside the perimeter; ignores positions with `undefined` groundSpeed; picks the chronologically earliest qualifying element.

## 2. Widen the arrival command and event

- [x] 2.1 In `src/modules/flights/application/command/report-arrival.command.ts`, widen `ReportArrivalCommand` to `(flightId, initiatorId: string | null = null, arrivalTime: Date = new Date(), automaticallyDetected: boolean = false)`, mirroring `ReportTakeoffCommand`.
- [x] 2.2 In `ReportArrivalHandler`, derive `scope = automaticallyDetected ? FlightEventScope.Operations : FlightEventScope.User`, stamp `timesheet.actual.arrivalTime = arrivalTime`, and emit `ArrivalWasReportedEvent` with `actorId: initiatorId` and `payload: { automaticallyDetected }`.
- [x] 2.3 In `src/core/domain/events/dto/flight.events.ts`, add `ArrivalReportedEventPayload = FlightEventPayload & { payload: { automaticallyDetected: boolean } }` and change `ArrivalWasReportedEvent extends FlightLifecycleEvent<ArrivalReportedEventPayload>`.
- [x] 2.4 Confirm the existing `ArrivalWasReported` consumers still compile: the `@OnEvent` persister in `events.repository.ts` and the WebSocket broadcaster in `broadcast-flight-event.listener.ts` — both handle the payload generically, no change expected.
- [x] 2.5 Add a colocated `report-arrival.command.spec.ts` covering scope/payload derivation: automatic → operations scope, no actor, `{ automaticallyDetected: true }`, `arrivalTime` used as passed; manual → user scope, crew actor, `{ automaticallyDetected: false }`, `arrivalTime` defaulting to now; wrong status → throws `InvalidStatusToReportArrivedError`.

## 3. Arrival detector listener

- [x] 3.1 Create `src/modules/flights/application/event/internal/detect-arrival.listener.ts`: `@OnEvent(FlightEventType.FlightPathWasUpdated)`; load flight via `GetFlightQuery`; return unless `status === FlightStatus.InCruise`; find the `AirportType.Destination` airport and return unless it has a `shape`; read `getFlightPath`; `firstArrivalPosition(path, destination.shape, ARRIVAL_GROUND_SPEED_THRESHOLD_KNOTS)`; if found dispatch `new ReportArrivalCommand(flightId, null, firstArrival.date, true)` and log.
- [x] 3.2 Define the `ARRIVAL_GROUND_SPEED_THRESHOLD_KNOTS = 50` constant used by the listener.
- [x] 3.3 Add colocated `detect-arrival.listener.spec.ts` (mirror `detect-takeoff.listener.spec.ts`): dispatches `ReportArrivalCommand(flightId, null, firstArrival.date, true)` when an in-cruise flight has an inside-and-slowed position; no-op when status is not `in_cruise`; no-op when the destination has no shape; no-op when no position is both inside and below the threshold.
- [x] 3.4 Register `DetectArrivalListener` in the `providers` array of `src/modules/flights/flights.module.ts`, beside `DetectTakeoffListener`.
- [x] 3.5 In `src/modules/flights/infra/service/position.service.ts`, change the `periodicallyBackupFlightPath` cron from `CronExpression.EVERY_10_MINUTES` to `CronExpression.EVERY_5_MINUTES` to halve arrival/takeoff detection latency.

## 4. Functional test alignment

- [x] 4.1 In `features/flight/actions/flight.report-arrival.feature`, update the manual `flight.arrival-reported` event assertion payload (the happy-path scenario's `/events` body) from `{}` to `{ "automaticallyDetected": false }`. Leave seeded arrival events in other features (`flight.report-on-block.feature`, `flight.start-offboarding.feature`, `flight.finish-offboarding.feature`, `flight.close.feature`) unchanged — they assert seeded `payload: {}`.

## 5. Verify

- [x] 5.1 `docker compose exec app npm run lint` and `format:fix`.
- [x] 5.2 `docker compose exec app npm run build`.
- [x] 5.3 `docker compose exec app npm test` (Jest unit specs: arrival-position helper, detector, handler).
- [x] 5.4 `docker compose exec app npx cucumber-js features/flight/actions/flight.report-arrival.feature` to confirm the manual flow and the updated payload assertion pass.
- [x] 5.5 `openspec validate automatic-arrival-detection --strict`.
