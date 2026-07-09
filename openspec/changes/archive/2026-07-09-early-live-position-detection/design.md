## Context

Live position tracking today is driven entirely by flight **status** through `PositionService`:

- `periodicallyBackupFlightPath` — `@Cron(EVERY_10_MINUTES)`. Calls `flightsRepository.findAllTrackable()` (statuses `taxiing_out` / `in_cruise` / `taxiing_in`), fetches `adsbClient.getTrackHistory(callsign)`, merges via `flightsRepository.updateFlightPath(id, track)`, and emits `LivePositionReceived` when `updateFlightPath` reports `isFirstReceipt`.
- `storeFlightPathOnFlightEnd` — `@OnEvent(OnBlockWasReported)`. Same fetch/merge/emit as a final backup at flight end.

`updateFlightPath` computes `isFirstReceipt = currentPath.length === 0 && newPath.length > 0` and flips the flight's `isPathAvailable` flag (exposed to the API as `hasFlightPath`) on first receipt. `LivePositionReceived` is emitted with `scope: System`, is persisted by `EventsRepository`, and is broadcast by `BroadcastFlightEventListener` → `FlightEventsGateway` to WebSocket clients subscribed to `flight:<id>`.

The earliest a flight is polled today is `taxiing_out`, i.e. after off-block. Cabin crew want confirmation that tracking is live during check-in/boarding. The event, its persistence, and its broadcast already exist — only the _detection point_ is too late, and the on-block emit fires in a situation where it carries no value.

Constraint: the functional (Cucumber) suite runs against the Dockerized app over HTTP/WebSocket with `SCHEDULER_ENABLED=false`, so `@Cron` jobs do not run during tests and cannot be triggered over the wire.

## Goals / Non-Goals

**Goals:**

- Detect and signal the first live position for flights in `checked_in` / `boarding_started` / `boarding_finished`, once per minute, reusing the existing `LivePositionReceived` event, persistence, and WebSocket broadcast.
- Stop signalling `LivePositionReceived` at on-block while keeping the final track backup.
- Add no new event types, DB columns, endpoints, or WebSocket messages.

**Non-Goals:**

- Changing the in-flight 10-minute backup cadence or the `taxiing_*` trackable set.
- Adding an HTTP or event trigger for early detection (decided: cron only).
- Surfacing `LivePositionReceived` in the flight-event history replay — current state is read from the flight resource's `hasFlightPath`; the event remains the live-transition push.
- Introducing unit specs or enabling the scheduler in tests.

## Decisions

### Reuse `LivePositionReceived` end-to-end; only move the detection point

The event, its `System` scope, its persistence path, and its WebSocket broadcast are unchanged. The only new behavior is _when_ first receipt is detected. This keeps the change small and avoids touching the WebSocket contract or the `FlightEvent` model.

Alternative — a distinct "tracking active" event: rejected. It would duplicate `LivePositionReceived`'s meaning and require new persistence/broadcast wiring for no added signal.

### A dedicated 1-minute cron, separate from the 10-minute backup

Add `PositionService.detectFirstLivePosition` as `@Cron(EVERY_MINUTE)`, iterating a new repository query and reusing the existing fetch → `updateFlightPath` → `emitLivePositionReceived` sequence. The per-flight body is identical to the existing crons, so the emit logic is factored into one shared private helper.

Alternative — extend `findAllTrackable` to include the early statuses and run everything on one cron: rejected. The cadences differ deliberately (1 min for pre-departure detection vs. 10 min for in-flight backup); unifying at 1 minute would multiply in-flight ADS-B calls ~10x, and unifying at 10 minutes would miss the "early" goal.

Alternative — trigger an immediate check on the `PilotCheckedIn` / `BoardingWasStarted` / `BoardingWasFinished` events (hybrid): considered and explicitly declined by the requester in favor of the cron-only approach. It would have made the path HTTP-testable and cut first-notification latency, at the cost of extra listeners; recorded here as the fallback if the coverage gap becomes a problem.

### Bound the poll set with `isPathAvailable = false`

The new query returns flights in the three pre-departure statuses **and** `isPathAvailable = false`. This (a) enforces "signal exactly once" — a flight drops out of the set the moment its first position lands — and (b) keeps the per-minute ADS-B call count proportional to only the flights still awaiting a first fix, which shrinks to zero as fixes arrive. Name it to read as intent, e.g. `findAwaitingFirstPosition()`, distinct from `findAllTrackable()`.

### Remove the on-block emit, keep the on-block fetch

In `storeFlightPathOnFlightEnd`, keep the `getTrackHistory` + `updateFlightPath` (final track completeness) and drop the `if (isFirstReceipt) emitLivePositionReceived(...)`. `updateFlightPath` still returns `isFirstReceipt`; the on-block handler simply ignores it. Rationale is in the proposal: a first fix arriving at on-block is post-flight and non-actionable, and the event is `System`-scoped so it is not part of the timeline.

## Risks / Trade-offs

- **Early-detection cron is not covered by the Cucumber suite** (scheduler disabled in tests, no HTTP trigger) → Accept; this matches the existing 10-minute backup cron's coverage. The behavioral change that _is_ HTTP-driven — on-block no longer emitting — gets a dedicated functional scenario. Keep the per-flight logic in one small helper so it stays reviewable and could be unit-tested later if the repo adopts unit specs.
- **Additional ADS-B request volume during check-in/boarding** → Bounded by the `isPathAvailable = false` filter; each flight is polled at most until its first fix, then never again in the pre-departure phase.
- **`EVERY_MINUTE` runs could overlap if a single sweep exceeds 60s** (sequential per-flight `await` over a large set) → Low likelihood at current scale and no worse in kind than the existing cron; if it materializes, cap or parallelize the sweep. Not addressed now.
- **Late-connecting WebSocket clients miss the one-shot broadcast** (the event is not replayed in history because it is `System`-scoped) → Intended; such clients read current state from the flight resource's `hasFlightPath`.
