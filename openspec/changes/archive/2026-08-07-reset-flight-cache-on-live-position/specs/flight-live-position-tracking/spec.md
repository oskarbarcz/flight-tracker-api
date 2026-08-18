## MODIFIED Requirements

### Requirement: Live position receipt is persisted and broadcast

When the system signals that a flight's live position has been received, it SHALL persist a `LivePositionReceived` flight event, SHALL broadcast it to WebSocket clients subscribed to that flight, and SHALL invalidate the cached flight body so that the next read of the flight reports its path as available. The event SHALL be recorded with `user` scope and no actor, reflecting that live tracking became available because the aircraft's transponder is active, so that it appears in the flight event timeline alongside crew actions rather than being hidden as a system-internal signal.

#### Scenario: Subscribed client is notified

- **WHEN** a `LivePositionReceived` event is signalled for a flight
- **THEN** a flight event of that type is stored for the flight and delivered to every WebSocket client subscribed to that flight

#### Scenario: Receipt appears in the flight event timeline

- **WHEN** a flight has received its first live position
- **THEN** the flight's event timeline includes the `LivePositionReceived` event with `user` scope and no actor

#### Scenario: A cached flight read reports the path immediately

- **WHEN** a flight's body has been read and cached while it had no stored path, and its first live position is then received
- **THEN** the next read of that flight reports its path as available rather than repeating the cached answer until the cache entry expires

#### Scenario: Later path updates do not evict the flight body

- **WHEN** a flight that already has a stored path receives a further path backup
- **THEN** the cached flight body is left in place, because the body states only whether a path exists and that answer has not changed
