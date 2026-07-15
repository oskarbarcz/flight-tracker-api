## Context

Takeoff already exists as a first-class lifecycle event: `ReportTakeoffHandler` guards
`taxiing_out`, stamps `timesheet.actual.takeoffTime = now`, transitions to `in_cruise`, and
emits `TakeoffWasReportedEvent` (scope `User`). It is triggered manually via
`POST /api/v1/flight/:id/report-takeoff`.

Two ingredients needed for automation are already present:

- **The path.** `PositionService` polls ADS-B and appends to `Flight.positionReports`
  (JSON) via `FlightsRepository.updateFlightPath`. `deduplicatePositionReports` sorts the
  stored path ascending by `date` and drops `0/0` coordinates, so "the earliest position
  outside the boundary" is well-defined. `findAllTrackable()` (statuses `taxiing_out`,
  `in_cruise`, `taxiing_in`) is backed up every 10 minutes; the on-block event triggers a
  final backup.
- **The boundary.** `Airport.shape` is a nullable polygon (`{latitude, longitude}[]`, min 3
  points, ring not explicitly closed). It is already selected on the flight read model, so
  the departure airport's shape is available without an extra query.

What is missing: a point-in-polygon test, a per-update trigger, and a way to report takeoff
with a chosen timestamp under system attribution.

## Goals / Non-Goals

**Goals:**

- Report takeoff automatically for flights whose departure airport has a boundary, using the
  timestamp of the first out-of-boundary path position.
- Reuse the existing takeoff mechanism (status transition, timesheet stamp, event) so manual
  and automatic takeoff are behaviourally identical.
- Keep the manual `report-takeoff` action and its behaviour unchanged.

**Non-Goals:**

- Altitude/`isOnGround`-based takeoff inference. Detection is purely geometric.
- Antimeridian-crossing boundaries (no seeded airport is near ±180°).
- Functional (Cucumber) coverage of the cron/event trigger (see Risks).
- Backfilling takeoff for flights already past `taxiing_out`.

## Decisions

### Reuse and widen `ReportTakeoffCommand` rather than add a separate command

`ReportTakeoffCommand` becomes `(flightId, initiatorId? = null, takeoffTime? = now, automaticallyDetected = false)`.
The command expresses intent (automatic or manual); the handler derives the event scope and
stamps `takeoffTime` (defaulting to `new Date()`). Manual callers pass nothing new and keep
today's behaviour; the detector passes the crossing timestamp, `initiatorId = null`, and
`automaticallyDetected = true`.

_Alternative considered:_ a dedicated `RegisterDetectedTakeoffCommand`. Rejected to avoid
duplicating the status/timesheet/event write logic across two handlers.

### The takeoff event carries `{ automaticallyDetected }` and stays visible in the timeline

`TakeoffWasReportedEvent` carries a typed payload `{ automaticallyDetected: boolean }` so
consumers can distinguish auto from manual. To keep the automatic takeoff visible in
`GET /flight/:id/events` (which returns only `user`/`operations`-scoped events), the handler
derives the event scope from intent: manual → `user` (with the crew actor), automatic →
`operations` (no actor). Both are persisted and broadcast; the payload flag is the
discriminator.

_Alternative considered:_ `system` scope for the automatic event. Rejected because
`findForFlight` filters `system`-scoped events out of the timeline, which would hide every
automatic takeoff and make the persisted flag meaningless in the REST list.

### Trigger via a `FlightPathWasUpdated` event, not inline or a new cron

`PositionService` emits a new `FlightPathWasUpdated` event after `updateFlightPath`. A
`@OnEvent(FlightPathWasUpdated)` detector listener lives in
`flights/application/event/internal/`, next to `off-block-delay.listener.ts` — the
established "event → downstream automation" pattern.

The event fires on every backup; the listener does the filtering, so it stays cheap:

1. Load the flight (`GetFlightQuery`).
2. `status !== taxiing_out` → return. This single guard enforces both "only after off-block"
   and idempotency once the flight is `in_cruise`.
3. Departure airport has no `shape` → return (feature disabled).
4. Read the sorted path (`getFlightPath`); find the earliest position outside `shape`.
5. None outside → return. Otherwise dispatch the widened `ReportTakeoffCommand` with that
   position's `date`. The handler's own `taxiing_out` guard makes the dispatch race-safe.

_Alternatives considered:_ (a) inline in `PositionService.trackFirstPosition` — cohesive but
couples detection to the polling internals; (b) a new cron in the `automations` module —
re-queries and re-reads paths for no benefit over reacting to the update that just happened.
The event keeps the detector decoupled and lets any future path-update source feed it.

### Point-in-polygon as a pure helper in `src/core/utils/`

New `isPointInsidePolygon(point, ring)` beside `distance.ts`: even-odd ray casting, treating
the coordinate list as a closed ring (the seeds do not repeat the first vertex). Planar
lat/long comparison is adequate at airport scale (a few km); no spherical correction and no
geospatial dependency.

### Detected time is "perimeter exit", accepted as the takeoff time

The `aeroway=aerodrome` polygon encloses the runways, so the aircraft crosses the boundary
already airborne, slightly after real wheels-up, bounded by the ADS-B sample spacing. Per the
capability definition, the first out-of-boundary position's timestamp _is_ the reported
takeoff time. The flight-event log's `createdAt` reflects detection time; the true takeoff
time lives in `timesheet.actual.takeoffTime`.

## Risks / Trade-offs

- **Point-in-polygon correctness** → highest-risk piece. Mitigation: a Jest unit spec exercises
  `isPointInsidePolygon` against the real seeded KBOS boundary (inside, outside, and near-edge
  points) plus the first-crossing selection, so a sign error is caught in CI rather than
  silently mis-timing or missing every takeoff.
- **Detection latency up to one backup cycle (~10 min)** → acceptable: the recorded time is
  backdated to the crossing position, so only the status flip is late, not the timesheet.
- **Event fires on every path update, including pre-departure and on-block backups** → the
  listener's `taxiing_out` guard makes all non-applicable updates cheap no-ops.
- **First stored position may already be outside the boundary** (aircraft only became
  trackable after leaving) → the earliest recorded position is used as the best available
  crossing time; consistent with the capability.

## Migration Plan

Additive, no schema change. Ships disabled wherever `Airport.shape` is null (e.g. airports
imported at runtime, which set `shape: null`). Rollback is removing the listener/event
emission; the widened command reverts to its current behaviour when the new arguments are
unused.

## Open Questions

- None blocking. Whether to suppress the `FlightPathWasUpdated` emission on the on-block
  backup is a minor optimisation; leaving it on is harmless given the listener guard.
