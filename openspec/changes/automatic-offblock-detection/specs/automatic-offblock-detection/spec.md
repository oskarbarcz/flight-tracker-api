## ADDED Requirements

### Requirement: Off-block is detected when the stored path shows the aircraft moving

The system SHALL, whenever a flight's stored path is updated while the flight is
`boarding_finished`, evaluate whether any stored position reports a ground speed above the
movement threshold of 3 knots. When at least one stored position exceeds the threshold, the
system SHALL report off-block for the flight. When no stored position exceeds the threshold —
including when positions carry no ground speed at all — the system SHALL take no action, and
off-block SHALL be reported only through the manual action.

#### Scenario: Aircraft is still stationary at the gate

- **WHEN** the stored path of a `boarding_finished` flight contains only positions whose ground speed is at or below 3 knots
- **THEN** off-block is not reported and the flight remains `boarding_finished`

#### Scenario: Aircraft starts moving

- **WHEN** the stored path of a `boarding_finished` flight contains at least one position whose ground speed is above 3 knots
- **THEN** off-block is reported and the flight becomes `taxiing_out`

#### Scenario: Positions carry no ground speed

- **WHEN** the stored path of a `boarding_finished` flight contains positions but none of them report a ground speed
- **THEN** off-block is not reported and the flight remains `boarding_finished`

### Requirement: Detected off-block time is the first moving position's timestamp

When off-block is detected automatically, the reported `actual.offBlockTime` SHALL be the
timestamp of the earliest (chronologically first) stored position whose ground speed exceeds
the movement threshold, not the time at which detection ran.

#### Scenario: Off-block time is backdated to the first movement

- **WHEN** a `boarding_finished` flight's earliest above-threshold stored position has timestamp `T`, and detection runs some time later on a subsequent path update
- **THEN** the flight's `actual.offBlockTime` is recorded as `T`

### Requirement: Automatic off-block is reported at most once and only while boarding is finished

The system SHALL report an automatic off-block only for a flight whose status is
`boarding_finished`. Once off-block has been reported and the flight has become
`taxiing_out`, subsequent path updates SHALL NOT report off-block again.

#### Scenario: A flight still boarding is not auto-reported

- **WHEN** a flight in `boarding_started` has stored positions above the movement threshold
- **THEN** off-block is not reported automatically

#### Scenario: A flight past off-block is not re-reported

- **WHEN** a flight is already `taxiing_out` and a later path update stores further above-threshold positions
- **THEN** off-block is not reported again and the recorded `actual.offBlockTime` is unchanged

### Requirement: Automatic off-block is flagged as automatic and visible in the timeline

When off-block is detected automatically, the resulting `flight.off-block-reported` event SHALL
have no human actor, SHALL carry a payload marking it `automaticallyDetected: true`, and SHALL
be scoped so it appears in the flight event timeline. A manually reported off-block
SHALL carry the same event with `automaticallyDetected: false`. In every other respect an
automatic off-block SHALL have the same effect as a manual one: the flight becomes
`taxiing_out`, `actual.offBlockTime` is stamped, and downstream off-block effects (such as
delay evaluation) occur identically.

#### Scenario: Automatic off-block emits an operations-scoped event flagged automatic

- **WHEN** the system reports an off-block automatically for a flight
- **THEN** a `flight.off-block-reported` event is emitted with operations scope, no actor, and payload `{ automaticallyDetected: true }`, the flight is `taxiing_out`, and `actual.offBlockTime` is set

#### Scenario: Manual off-block is flagged not automatic

- **WHEN** a crew member reports off-block manually
- **THEN** a `flight.off-block-reported` event is emitted with payload `{ automaticallyDetected: false }`
