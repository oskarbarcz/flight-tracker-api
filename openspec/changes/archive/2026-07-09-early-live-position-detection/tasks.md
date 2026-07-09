## 1. Repository query for flights awaiting first position

- [x] 1.1 Add `findAwaitingFirstPosition(): Promise<FlightIdAndCallsign[]>` to `FlightsRepository`, mirroring `findAllTrackable` but querying `status in [CheckedIn, BoardingStarted, BoardingFinished]` AND `isPathAvailable = false`, selecting `flightIdAndCallsign`.

## 2. PositionService: early-detection cron and on-block emit removal

- [x] 2.1 Extract the shared per-flight body (`getTrackHistory` → `updateFlightPath` → `emitLivePositionReceived` when `isFirstReceipt`) into one private helper, and route the existing `periodicallyBackupFlightPath` cron through it. Guard each flight so one failing ADS-B call logs and continues instead of aborting the sweep.
- [x] 2.2 Add `detectFirstLivePosition()` as `@Cron(CronExpression.EVERY_MINUTE)` that iterates `flightsRepository.findAwaitingFirstPosition()` and runs the shared helper for each flight.
- [x] 2.3 In `storeFlightPathOnFlightEnd` (`@OnEvent(OnBlockWasReported)`), remove the `if (isFirstReceipt) this.emitLivePositionReceived(...)` block; keep the `getTrackHistory` + `updateFlightPath` backup fetch and the existing try/catch. (No `flights.module.ts` change — `PositionService` is already a registered provider.)

## 3. Functional coverage: on-block no longer signals first receipt

- [x] 3.1 Align the seed with the scenario first (statically): confirmed the already-seeded flight `04be266c-df78-4bec-9f50-281cc02ce7f2` (callsign `AAL4913`, mock-backed) is in `taxiing_in` with no seeded path (`isPathAvailable`/`positionReports` default false/empty — on-block is its first receipt, per the existing `hasFlightPath: true` assertion). No seed change needed.
- [x] 3.2 Descoped at requester's instruction: do **not** add a negative WebSocket assertion (`I should not receive a live flight event of type ...`). A timed negative wait adds latency to the suite for little value, and the on-block emit is `System`-scoped (never in the timeline) so its removal is invisible to the event/history assertions.
- [x] 3.3 Descoped (see 3.2). The on-block removal is covered as a regression: the existing report-on-block happy-path scenario keeps its `flight.on-block-reported` live-event assertion and full `/events` list, and must stay green with the emit removed. No new scenario or step added.

## 4. Verify

- [x] 4.1 `docker compose exec app npm run lint:fix` and `docker compose exec app npm run format:fix`, then `docker compose exec app npm run build`.
- [x] 4.2 `docker compose exec app npx cucumber-js features/flight/websocket/flight.websocket-events.feature` and `docker compose exec app npx cucumber-js features/flight/actions/flight.report-on-block.feature` — both green.
- [x] 4.3 Sanity-check the new cron wiring by reading `PositionService`: `detectFirstLivePosition` is decorated with `@Cron(EVERY_MINUTE)`, the on-block handler no longer emits `LivePositionReceived`, and both crons share the single helper. (End-to-end cron execution is not covered by the suite — scheduler is disabled in tests.)
