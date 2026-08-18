## Context

See `proposal.md` § Why for motivation and
`specs/flight-live-position-tracking/spec.md` for the behaviour contract.

Two pieces of current state shape the approach:

**Invalidation is already event-driven and central.** `FlightCacheListener` holds one
handler, `invalidateFlightBody`, stacked with an `@OnEvent` decorator per flight event,
and a second handler for the delay entries. Nothing else in the codebase deletes flight
body keys, so the listener's decorator list _is_ the invalidation contract — an event
missing from it means a stale read, silently.

**First receipt is already an event.** `LivePositionReceived` is raised once per flight
on the transition from "no stored path" to "stored path", persisted as a flight event and
broadcast over WebSocket. The signal the cache needs therefore already exists and already
carries `payload.flightId`, which is all `flightBodyCacheKeys` takes.

## Goals / Non-Goals

**Goals:**

- Make the REST body agree with the WebSocket broadcast about when live tracking started.

**Non-Goals:**

- Invalidating on every subsequent path update. `FlightPathWasUpdated` fires on each
  poll, up to once a minute per tracked flight; the flight body says only _whether_ a
  path exists, not what is in it, so re-invalidating on every backup would evict the
  entry continuously for no change in the answer.
- Touching the flight path endpoint itself, which is not cached.
- Revisiting the 60-second TTL or the auth/anon key split.

## Decisions

### The event joins `invalidateFlightBody`, rather than getting its own handler

`@OnEvent(FlightEventType.LivePositionReceived)` is added to the existing stack.

_Why:_ the effect wanted is identical to every other lifecycle event's — drop
`flight:{id}:auth` and `flight:{id}:anon`. A dedicated handler would duplicate the body
of an existing one to no end.

_Consequence:_ the listener's decorator list stays the single place to read what
invalidates a flight body.

### Only first receipt invalidates, not each path update

`FlightPathWasUpdated` stays absent from the listener.

_Why:_ the two signals differ in exactly the way that matters here — first receipt
changes the body (`isPathAvailable`), a later backup does not. Since the once-only event
already fires on the only transition the body reflects, adding the per-poll event would
buy nothing and would evict a hot entry once a minute for every flight in the air.

## Risks / Trade-offs

**Cached reads still lag a database reset** → the Cucumber `I set database to initial
state` step truncates and reseeds without flushing the cache, so a flight body cached
before a reset survives it. That is a property of the test harness, not of this change,
and it is why the scenario for this behaviour asserts on a flight whose body is read for
the first time after the position arrives.

**One additional miss per flight** → the entry is rebuilt on the next read from the same
query the cache already wraps. Negligible against the once-per-flight frequency.

## Migration Plan

None. No schema, no payload, no configuration. Reverting the line restores the previous
behaviour; nothing persists that would need cleaning up.
