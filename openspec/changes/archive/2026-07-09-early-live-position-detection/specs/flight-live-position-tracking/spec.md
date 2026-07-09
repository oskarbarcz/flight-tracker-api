## ADDED Requirements

### Requirement: First live position is detected during check-in and boarding

The system SHALL periodically poll ADS-B for the first available live position of every flight whose status is `checked_in`, `boarding_started`, or `boarding_finished` and that does not yet have a stored flight path. The poll SHALL run once per minute. When a poll produces the first stored position for a flight, the system SHALL signal that the flight's live position has been received.

#### Scenario: Position becomes available while boarding

- **WHEN** a flight is in `boarding_started` with no stored path and ADS-B begins returning positions for its callsign
- **THEN** within the next poll the position is stored, the flight's path becomes available, and a `LivePositionReceived` event is signalled for that flight

#### Scenario: No position available yet

- **WHEN** a flight is in `checked_in` with no stored path and ADS-B returns no positions for its callsign
- **THEN** no path is stored and no `LivePositionReceived` event is signalled

#### Scenario: Flight not yet checked in is not polled

- **WHEN** a flight is in `created` or `ready`
- **THEN** the early-detection poll does not request ADS-B data for that flight

### Requirement: First live position continues to be detected in flight

The system SHALL continue to back up flight paths for flights whose status is `taxiing_out`, `in_cruise`, or `taxiing_in`, and SHALL signal `LivePositionReceived` when such a backup produces the first stored position for a flight.

#### Scenario: First position appears only after departure

- **WHEN** a flight reaches `taxiing_out` with no stored path and ADS-B begins returning positions
- **THEN** the in-flight backup stores the position and signals `LivePositionReceived` for that flight

### Requirement: First live position is signalled exactly once per flight

The system SHALL signal `LivePositionReceived` only on the transition from no stored path to a stored path. Once a flight has a stored path, subsequent polls SHALL NOT signal the event again.

#### Scenario: Subsequent polls do not re-signal

- **WHEN** a flight already has a stored path and a later poll stores additional positions
- **THEN** the additional positions are stored and no further `LivePositionReceived` event is signalled

### Requirement: Live position receipt is persisted and broadcast

When the system signals that a flight's live position has been received, it SHALL persist a `LivePositionReceived` flight event and SHALL broadcast it to WebSocket clients subscribed to that flight.

#### Scenario: Subscribed client is notified

- **WHEN** a `LivePositionReceived` event is signalled for a flight
- **THEN** a flight event of that type is stored for the flight and delivered to every WebSocket client subscribed to that flight

### Requirement: Live position receipt is not signalled at on-block

When a flight reports on-block, the system SHALL perform its final flight-path backup fetch but SHALL NOT signal `LivePositionReceived`, even when the on-block backup produces the flight's first stored position.

#### Scenario: On-block backs up the track without signalling first receipt

- **WHEN** a flight with no stored path reports on-block and its final backup fetch returns positions
- **THEN** the positions are stored and no `LivePositionReceived` event is signalled or broadcast
