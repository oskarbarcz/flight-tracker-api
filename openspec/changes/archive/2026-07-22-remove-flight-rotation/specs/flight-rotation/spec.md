## REMOVED Requirements

### Requirement: Operator rotation management

**Reason**: The rotation feature is being retired and reimplemented from scratch in a fundamentally different way. Its current shape (operator-owned named rotations threaded through flight and user state) does not fit the new design, so all existing behavior is removed rather than migrated.

**Migration**: None. Existing rotation records are discarded when the `rotation` table is dropped. Any client relying on `/api/v1/operator/:operatorId/rotation[/:rotationId]` must stop calling these endpoints; the replacement will be documented when the new rotation feature ships.

The system SHALL allow operators to create, read, update, list, and delete named rotations that reference a pilot.

#### Scenario: Operator rotation CRUD

- **WHEN** a client calls any of `POST/GET/PATCH/DELETE /api/v1/operator/:operatorId/rotation[/:rotationId]`
- **THEN** the endpoint no longer exists and the behavior is removed entirely

### Requirement: Flight rotation assignment

**Reason**: Assigning a flight to a rotation depended on the operator rotation entity being removed above, and the assignment model changes in the new design.

**Migration**: None. The `flight.rotationId` column is dropped and `rotation`/`rotationId` no longer appear in flight payloads. Clients must stop calling `/api/v1/flight/:flightId/rotation/:rotationId`.

The system SHALL allow a flight to be assigned to and removed from a rotation, exposing the linked rotation on the flight resource and emitting `flight.added-to-rotation` / `flight.removed-from-rotation` domain events.

#### Scenario: Flight rotation assignment

- **WHEN** a client calls `POST/DELETE /api/v1/flight/:flightId/rotation/:rotationId`
- **THEN** the endpoints no longer exist, `rotation`/`rotationId` are absent from flight and flight-event payloads, and the two rotation domain events are no longer emitted

### Requirement: Pilot current rotation tracking

**Reason**: Automatically tracking a pilot's current rotation across check-in and flight close is superseded by the new design.

**Migration**: None. The `user.currentRotationId` column and unique index are dropped and `currentRotationId` no longer appears in the user payload.

The system SHALL set a pilot's current rotation when they check in to a flight belonging to a rotation, and clear it when the last flight in that rotation is closed.

#### Scenario: Pilot current rotation tracking

- **WHEN** a pilot checks in to a flight or the last flight in a rotation is closed
- **THEN** no current-rotation state is maintained and `currentRotationId` is absent from the user payload
