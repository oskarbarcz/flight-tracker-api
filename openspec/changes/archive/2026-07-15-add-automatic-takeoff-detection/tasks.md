## 1. Geometry helper

- [x] 1.1 Add `isPointInsidePolygon(point, ring)` to `src/core/utils/perimeter.ts` (even-odd ray casting, closed-ring, planar lat/long)
- [x] 1.2 Add `firstPositionOutsidePerimeter(path, shape)` returning the earliest sorted position outside the ring, or null

## 2. Path-update event

- [x] 2.1 Add `FlightPathWasUpdatedEvent` and `FlightEventType.FlightPathWasUpdated` to `flight.events.ts`
- [x] 2.2 Emit `FlightPathWasUpdatedEvent` from `PositionService` after each `updateFlightPath`
- [x] 2.3 Keep the event internal-only — not added to the persistence/broadcast allowlists (it fires on every backup, is System-scoped, and the detector is its only consumer)

## 3. Takeoff command + event payload

- [x] 3.1 Widen `ReportTakeoffCommand` to `(flightId, initiatorId? = null, takeoffTime? = now, automaticallyDetected = false)`
- [x] 3.2 Derive the event scope in the handler (manual → `user` with actor; automatic → `operations`, no actor), stamp the provided `takeoffTime`, and emit with payload `{ automaticallyDetected }`
- [x] 3.3 Give `TakeoffWasReportedEvent` a typed payload `{ automaticallyDetected: boolean }`
- [x] 3.4 Manual HTTP action unchanged — still `new ReportTakeoffCommand(id, request.user.sub)`

## 4. Detector listener + wiring

- [x] 4.1 Add `detect-takeoff.listener.ts` (`DetectTakeoffListener`) with `@OnEvent(FlightPathWasUpdated)`
- [x] 4.2 Guard chain: load flight → require `taxiing_out` → require departure `shape` → first out-of-boundary position → dispatch `ReportTakeoffCommand(..., automaticallyDetected = true)`
- [x] 4.3 Register the listener in the flights module `providers`

## 5. Tests

- [x] 5.1 `perimeter.spec.ts` — geometry unit tests against the real KBOS boundary + first-crossing selection
- [x] 5.2 `detect-takeoff.listener.spec.ts` — dispatch on crossing, plus the three no-op guards (not taxiing-out, no shape, all-inside)
- [x] 5.3 `report-takeoff.command.spec.ts` — manual (user, `automaticallyDetected: false`) vs automatic (operations, no actor, backdated time, `automaticallyDetected: true`) + status guard
- [x] 5.4 Update the manual `report-takeoff.feature` events assertion to `{ automaticallyDetected: false }`
- [x] 5.5 Configure Jest (ts-jest, specs colocated) + `tsconfig.build.json` so `nest build` excludes specs

## 6. Gates

- [x] 6.1 `npm test`, `npm run build`, and `npm run lint` all pass
