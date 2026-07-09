## Why

Cabin crew want to know that a flight's live position is being tracked **before** departure — as early as passenger check-in — so they can confirm the transponder is broadcasting during boarding. Today the first position is only detected once the flight is airborne-adjacent: the ADS-B backup cron polls flights whose status is `taxiing_out` / `in_cruise` / `taxiing_in`, so the `LivePositionReceived` event effectively fires no earlier than off-block. There is no early feedback loop during check-in or boarding.

## What Changes

- **Detect the first live position during check-in and boarding.** A new 1-minute cron polls ADS-B for flights in `checked_in`, `boarding_started`, or `boarding_finished` that do not yet have a stored path, and emits `FlightEventType.LivePositionReceived` on first receipt. The event is persisted and broadcast over WebSocket by the existing plumbing (`EventsRepository` + `BroadcastFlightEventListener` → `FlightEventsGateway`), so no new storage or transport is added.
- **Stop emitting `LivePositionReceived` on `OnBlockWasReported`.** The on-block handler still performs its final track backup fetch, but no longer emits the event. By on-block the flight has landed and parked; a "first position" arriving that late is a degenerate case with no actionable value, and the event is `System`-scoped so it never appears in the flight timeline anyway.
- No change to the existing 10-minute in-flight backup cron or to the `LivePositionReceived` event shape, storage, or WebSocket broadcast.

## Capabilities

### New Capabilities

- `flight-live-position-tracking`: When ADS-B position data becomes available for a flight, the system detects the first receipt, persists a `LivePositionReceived` flight event, and broadcasts it to subscribed WebSocket clients. Detection begins at check-in/boarding via a dedicated poll and continues through the flight via the existing backup cron. First receipt is signalled exactly once per flight and is never emitted at on-block.

### Modified Capabilities

<!-- None. No existing spec covers position tracking. -->

## Impact

- **Code:**
  - `src/modules/flights/infra/service/position.service.ts` — add the 1-minute early-detection cron; remove the `emitLivePositionReceived` call from `storeFlightPathOnFlightEnd` (keep the backup fetch).
  - `src/modules/flights/infra/database/repository/flights.repository.ts` — add a query for flights awaiting first position (statuses `checked_in`/`boarding_started`/`boarding_finished` with `isPathAvailable = false`).
- **Behavior:** Earlier `LivePositionReceived` broadcasts (during check-in/boarding); no `LivePositionReceived` on on-block.
- **Load:** One additional ADS-B request per minute per checked-in/boarding flight that has no path yet; the set self-empties as soon as each flight's first position is received (path becomes available).
- **No changes** to the WebSocket contract, the `FlightEvent` DB model, the event enum/payload, REST endpoints, or the Prisma schema. Current-state consumers keep using the flight resource's `hasFlightPath` flag; the event remains the live-transition push.
- **Testing:** The on-block behavioral change is functionally testable (HTTP-driven). The early-detection cron is not exercised by the Cucumber suite — the scheduler is disabled in tests (`SCHEDULER_ENABLED=false`) and there is no HTTP trigger, the same coverage gap the existing 10-minute backup cron already has.
