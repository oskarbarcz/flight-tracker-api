# automatic-arrival-detection

## Purpose

Detect arrival (landing) automatically from a flight's stored ADS-B path instead of relying
solely on a manual crew action. Airports carry a boundary polygon (`Airport.shape`), the backend
already backs up each flight's path, and each stored position already carries a `groundSpeed`
(knots); once the recorded path shows the aircraft inside its destination airport's perimeter and
slowed below taxi-in speed, it has arrived. For a flight in `in_cruise` whose destination airport
has a boundary, the system inspects the stored path on each update and reports arrival when a
position is both inside the perimeter and below the arrival speed threshold of 50 knots,
backdating `actual.arrivalTime` to that position. Detection is gated by boundary geometry, runs at
most once per flight, and produces the same status transition and `flight.arrival-reported` event
as a manual arrival, flagged `automaticallyDetected: true`.

## Requirements

### Requirement: Automatic arrival detection is gated by the destination airport boundary

The system SHALL perform automatic arrival detection for a flight only when its destination
airport has a defined boundary shape. When the destination airport has no boundary shape,
automatic arrival detection SHALL be disabled for that flight and arrival SHALL be reported
only through the manual action.

#### Scenario: Destination airport has a boundary

- **WHEN** a flight is `in_cruise` and its destination airport has a boundary shape
- **THEN** the system evaluates the flight's stored path for automatic arrival detection

#### Scenario: Destination airport has no boundary

- **WHEN** a flight is `in_cruise` and its destination airport has no boundary shape
- **THEN** the system does not report arrival automatically for that flight, regardless of its stored path

### Requirement: Arrival is detected when the stored path shows the aircraft inside the destination boundary below the arrival speed

The system SHALL, whenever a flight's stored path is updated while the flight is `in_cruise`
and its destination airport has a boundary shape, evaluate whether any stored position is both
inside that boundary and reports a ground speed below the arrival threshold of 50 knots. When
at least one stored position satisfies both conditions, the system SHALL report arrival for the
flight. When no stored position satisfies both conditions — including when the qualifying
positions carry no ground speed at all — the system SHALL take no action, and arrival SHALL be
reported only through the manual action.

#### Scenario: Aircraft is inside the boundary and has slowed below the arrival speed

- **WHEN** the stored path of an `in_cruise` flight contains at least one position that is inside the destination boundary and whose ground speed is below 50 knots
- **THEN** arrival is reported and the flight becomes `taxiing_in`

#### Scenario: Aircraft is inside the boundary but still moving at or above the arrival speed

- **WHEN** the stored path of an `in_cruise` flight contains positions inside the destination boundary but every such position reports a ground speed at or above 50 knots
- **THEN** arrival is not reported and the flight remains `in_cruise`

#### Scenario: Aircraft has slowed below the arrival speed but is not yet inside the boundary

- **WHEN** the stored path of an `in_cruise` flight contains positions whose ground speed is below 50 knots but none of them is inside the destination boundary
- **THEN** arrival is not reported and the flight remains `in_cruise`

#### Scenario: Qualifying positions carry no ground speed

- **WHEN** the stored path of an `in_cruise` flight contains positions inside the destination boundary but none of them reports a ground speed
- **THEN** arrival is not reported and the flight remains `in_cruise`

### Requirement: Detected arrival time is the first qualifying position's timestamp

When arrival is detected automatically, the reported `actual.arrivalTime` SHALL be the
timestamp of the earliest (chronologically first) stored position that is both inside the
destination boundary and below the arrival speed threshold, not the time at which detection ran.

#### Scenario: Arrival time is backdated to the first qualifying position

- **WHEN** a flight's earliest inside-and-slowed stored position has timestamp `T`, and detection runs some time later on a subsequent path update
- **THEN** the flight's `actual.arrivalTime` is recorded as `T`

### Requirement: Automatic arrival is reported at most once and only while in cruise

The system SHALL report an automatic arrival only for a flight whose status is `in_cruise`.
Once arrival has been reported and the flight has become `taxiing_in`, subsequent path updates
SHALL NOT report arrival again.

#### Scenario: A flight before takeoff is not auto-reported

- **WHEN** a flight that has not yet reported takeoff has stored positions inside the destination boundary below the arrival speed
- **THEN** arrival is not reported automatically

#### Scenario: A flight past arrival is not re-reported

- **WHEN** a flight is already `taxiing_in` and a later path update stores further inside-and-slowed positions
- **THEN** arrival is not reported again and the recorded `actual.arrivalTime` is unchanged

### Requirement: Automatic arrival is flagged as automatic and visible in the timeline

When arrival is detected automatically, the resulting `flight.arrival-reported` event SHALL
have no human actor, SHALL carry a payload marking it `automaticallyDetected: true`, and SHALL
be scoped so it appears in the flight event timeline. A manually reported arrival SHALL carry
the same event with `automaticallyDetected: false`. In every other respect an automatic arrival
SHALL have the same effect as a manual one: the flight becomes `taxiing_in` and
`actual.arrivalTime` is stamped.

#### Scenario: Automatic arrival emits an operations-scoped event flagged automatic

- **WHEN** the system reports an arrival automatically for a flight
- **THEN** a `flight.arrival-reported` event is emitted with operations scope, no actor, and payload `{ automaticallyDetected: true }`, the flight is `taxiing_in`, and `actual.arrivalTime` is set

#### Scenario: Manual arrival is flagged not automatic

- **WHEN** a crew member reports arrival manually
- **THEN** a `flight.arrival-reported` event is emitted with payload `{ automaticallyDetected: false }`
