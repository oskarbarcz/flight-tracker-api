## ADDED Requirements

### Requirement: Automatic takeoff detection is gated by the departure airport boundary

The system SHALL perform automatic takeoff detection for a flight only when its departure
airport has a defined boundary shape. When the departure airport has no boundary shape,
automatic takeoff detection SHALL be disabled for that flight and takeoff SHALL be reported
only through the manual action.

#### Scenario: Departure airport has a boundary

- **WHEN** a flight is `taxiing_out` and its departure airport has a boundary shape
- **THEN** the system evaluates the flight's stored path for automatic takeoff detection

#### Scenario: Departure airport has no boundary

- **WHEN** a flight is `taxiing_out` and its departure airport has no boundary shape
- **THEN** the system does not report takeoff automatically for that flight, regardless of its stored path

### Requirement: Takeoff is detected when the stored path leaves the departure boundary

The system SHALL, whenever a flight's stored path is updated while the flight is
`taxiing_out` and its departure airport has a boundary shape, evaluate whether any stored
position lies outside that boundary. When at least one stored position is outside the
boundary, the system SHALL report takeoff for the flight. When every stored position is
inside the boundary, the system SHALL take no action.

#### Scenario: Aircraft is still within the perimeter

- **WHEN** the stored path of a `taxiing_out` flight contains only positions inside the departure boundary
- **THEN** takeoff is not reported and the flight remains `taxiing_out`

#### Scenario: Aircraft has left the perimeter

- **WHEN** the stored path of a `taxiing_out` flight contains at least one position outside the departure boundary
- **THEN** takeoff is reported and the flight becomes `in_cruise`

### Requirement: Detected takeoff time is the first out-of-boundary position's timestamp

When takeoff is detected automatically, the reported `actual.takeoffTime` SHALL be the
timestamp of the earliest (chronologically first) stored position that lies outside the
departure boundary, not the time at which detection ran.

#### Scenario: Takeoff time is backdated to the boundary crossing

- **WHEN** a flight's earliest out-of-boundary stored position has timestamp `T`, and detection runs some time later on a subsequent path update
- **THEN** the flight's `actual.takeoffTime` is recorded as `T`

### Requirement: Automatic takeoff is reported at most once and only while taxiing out

The system SHALL report an automatic takeoff only for a flight whose status is
`taxiing_out`. Once takeoff has been reported and the flight has become `in_cruise`,
subsequent path updates SHALL NOT report takeoff again.

#### Scenario: A flight before off-block is not auto-reported

- **WHEN** a flight that has not yet reported off-block has stored positions outside the departure boundary
- **THEN** takeoff is not reported automatically

#### Scenario: A flight past takeoff is not re-reported

- **WHEN** a flight is already `in_cruise` and a later path update stores further out-of-boundary positions
- **THEN** takeoff is not reported again and the recorded `actual.takeoffTime` is unchanged

### Requirement: Automatic takeoff is flagged as automatic and visible in the timeline

When takeoff is detected automatically, the resulting `flight.takeoff-reported` event SHALL
have no human actor, SHALL carry a payload marking it `automaticallyDetected: true`, and
SHALL be scoped so it appears in the flight event timeline. A manually reported takeoff SHALL
carry the same event with `automaticallyDetected: false`. In every other respect an automatic
takeoff SHALL have the same effect as a manual one: the flight becomes `in_cruise` and
`actual.takeoffTime` is stamped.

#### Scenario: Automatic takeoff emits an operations-scoped event flagged automatic

- **WHEN** the system reports a takeoff automatically for a flight
- **THEN** a `flight.takeoff-reported` event is emitted with operations scope, no actor, and payload `{ automaticallyDetected: true }`, the flight is `in_cruise`, and `actual.takeoffTime` is set

#### Scenario: Manual takeoff is flagged not automatic

- **WHEN** a crew member reports takeoff manually
- **THEN** a `flight.takeoff-reported` event is emitted with payload `{ automaticallyDetected: false }`
