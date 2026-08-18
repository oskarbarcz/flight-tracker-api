## 1. Cache invalidation

- [x] 1.1 Add `@OnEvent(FlightEventType.LivePositionReceived)` to `invalidateFlightBody` in `src/modules/flights/application/event/internal/flight-cache.listener.ts`, leaving `FlightPathWasUpdated` out so per-poll backups do not evict the entry

## 2. Verification

- [x] 2.1 Run lint and the Jest unit suite
- [x] 2.2 Confirm against the live-position features that a flight read after first receipt reports its path as available
