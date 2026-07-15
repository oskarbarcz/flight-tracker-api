## ADDED Requirements

### Requirement: Flight path updates are signalled

Each time the system polls ADS-B and updates a flight's stored path, it SHALL signal a
`FlightPathWasUpdated` event carrying the flight identifier. This signal is emitted on every
path backup — during pre-departure first-position detection, in-flight backup, and the
on-block backup — and is distinct from the once-only `LivePositionReceived` signal, which
continues to fire only on the first stored position.

#### Scenario: Backup during taxi-out signals a path update

- **WHEN** the in-flight backup stores positions for a `taxiing_out` flight
- **THEN** a `FlightPathWasUpdated` event is signalled for that flight

#### Scenario: Path update signal is independent of first receipt

- **WHEN** a flight that already has a stored path receives a later backup that stores additional positions
- **THEN** a `FlightPathWasUpdated` event is signalled and no further `LivePositionReceived` event is signalled
