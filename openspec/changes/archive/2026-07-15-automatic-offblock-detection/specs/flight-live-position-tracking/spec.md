## ADDED Requirements

### Requirement: Boarding-finished flights are tracked continuously until off-block

The system SHALL continue to poll ADS-B once per minute for every flight whose status is
`boarding_finished`, including after its first position has been stored, until the flight
reports off-block. Each such backup SHALL signal a `FlightPathWasUpdated` event, so that a
rise in the aircraft's ground speed at pushback is observed while the flight waits at the
gate. This continuous polling SHALL NOT signal `LivePositionReceived` again for a flight that
already has a stored path.

#### Scenario: Boarding-finished flight is polled after its first position

- **WHEN** a flight is `boarding_finished` and already has a stored path
- **THEN** the once-per-minute backup continues to fetch ADS-B for it and signals a `FlightPathWasUpdated` event

#### Scenario: Continued polling does not re-signal first receipt

- **WHEN** a `boarding_finished` flight that already has a stored path is polled again and additional positions are stored
- **THEN** a `FlightPathWasUpdated` event is signalled and no further `LivePositionReceived` event is signalled

#### Scenario: Polling stops once the flight leaves the gate

- **WHEN** a flight transitions out of `boarding_finished` to `taxiing_out`
- **THEN** it is no longer selected by the boarding-finished backup and is instead tracked by the in-flight backup
