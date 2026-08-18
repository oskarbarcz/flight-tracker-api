## Why

The flight body served by `GET /api/v1/flight/{id}` is cached for 60 seconds, and
`FlightCacheListener` drops that entry whenever a flight event changes what the body
says. Every lifecycle event was wired into it except `LivePositionReceived` — the one
event that flips `isPathAvailable` from `false` to `true`.

The consequence is visible exactly where live tracking matters most. A client watching a
flight that is about to depart reads the cached body, learns that no path is available,
and keeps reading that same answer for up to a minute after the aircraft's transponder
came alive. The WebSocket subscriber is told immediately, so the two channels disagree:
the socket announces live tracking while the REST body still denies it. A client that
polls rather than subscribes sees the transition late, or not at all if another event
happens to refresh the entry first.

## What Changes

- Invalidate the cached flight body when a flight's first live position is received, so
  the next read reports the path as available.
- No API, payload, or event contract changes: the same body is served, one cache
  generation earlier.

## Capabilities

### Modified Capabilities

- `flight-live-position-tracking`: first receipt of a live position now invalidates the
  cached flight body alongside persisting and broadcasting the event.

## Impact

- **Code**: one event added to the `invalidateFlightBody` listener in
  `src/modules/flights/application/event/internal/flight-cache.listener.ts`.
- **Behaviour**: a read following first receipt reports `isPathAvailable: true` without
  waiting out the 60-second TTL. Cached reads become at most one request stale rather
  than up to a minute stale.
- **Load**: one extra cache miss per flight, once, on the transition. The entry is
  rebuilt by the next read exactly as any other lifecycle event rebuilds it.
- **Not affected**: the delay and crew cache entries, which no live position changes.
