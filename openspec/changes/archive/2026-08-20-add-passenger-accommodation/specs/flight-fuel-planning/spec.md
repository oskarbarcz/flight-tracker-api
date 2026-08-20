## ADDED Requirements

### Requirement: The loadsheet may carry a passenger breakdown per cabin class

The system SHALL accept on a loadsheet an optional breakdown of the passenger count per cabin
class, covering first, business, premium economy and economy. Where the breakdown is given its
values SHALL sum to the loadsheet's passenger count, and a breakdown that does not SHALL be
rejected as unprocessable. Where it is omitted the loadsheet SHALL remain valid, and the
passenger count alone SHALL be authoritative.

#### Scenario: A loadsheet without a breakdown remains valid

- **WHEN** a loadsheet is submitted carrying only a passenger count
- **THEN** the loadsheet is accepted

#### Scenario: A consistent breakdown is accepted

- **WHEN** a loadsheet is submitted whose per-class passenger counts sum to its passenger count
- **THEN** the loadsheet is accepted and the breakdown is stored

#### Scenario: An inconsistent breakdown is rejected

- **WHEN** a loadsheet is submitted whose per-class passenger counts do not sum to its passenger count
- **THEN** the request is rejected as unprocessable

#### Scenario: A breakdown is reported on reads

- **GIVEN** a flight whose loadsheet carries a per-class breakdown
- **WHEN** the loadsheet is read
- **THEN** the breakdown is reported alongside the passenger count

### Requirement: A loadsheet passenger count is limited by the aircraft's seat capacity

The system SHALL reject as unprocessable a loadsheet whose passenger count exceeds the number
of seats in the cabin layout assigned to the flight's aircraft. Where the aircraft has no
assigned cabin layout the passenger count SHALL NOT be limited, because no seat capacity is
known.

#### Scenario: An over-capacity count is rejected

- **GIVEN** a flight whose aircraft has an assigned cabin layout
- **WHEN** a loadsheet is submitted reporting more passengers than that layout has seats
- **THEN** the request is rejected as unprocessable

#### Scenario: A count within capacity is accepted

- **GIVEN** a flight whose aircraft has an assigned cabin layout
- **WHEN** a loadsheet is submitted reporting no more passengers than that layout has seats
- **THEN** the loadsheet is accepted

#### Scenario: No layout means no limit

- **GIVEN** a flight whose aircraft has no assigned cabin layout
- **WHEN** a loadsheet is submitted reporting any passenger count
- **THEN** the loadsheet is accepted
