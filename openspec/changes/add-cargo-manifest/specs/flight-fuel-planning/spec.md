## ADDED Requirements

### Requirement: A loadsheet cargo tonnage is limited by the aircraft's hold capacity

The system SHALL reject as unprocessable a loadsheet whose cargo tonnage exceeds what the hold
variant resolved for the flight's aircraft can carry, whether by weight or by volume. Where the
aircraft's airframe type has no curated hold data the cargo tonnage SHALL NOT be limited, because
no hold capacity is known.

#### Scenario: An over-capacity cargo tonnage is rejected

- **GIVEN** a flight whose aircraft's hold can carry less than the cargo the loadsheet reports
- **WHEN** that loadsheet is submitted
- **THEN** the request is rejected as unprocessable

#### Scenario: A tonnage exceeding the hold's volume is rejected

- **GIVEN** a loadsheet whose cargo cannot fit the hold's volume at any plausible density
- **WHEN** it is submitted
- **THEN** the request is rejected as unprocessable

#### Scenario: A tonnage at capacity is accepted

- **WHEN** a loadsheet reports exactly the cargo tonnage the hold can carry
- **THEN** the loadsheet is accepted

#### Scenario: An aircraft without hold data is not limited

- **GIVEN** a flight whose aircraft's airframe type has no curated hold data
- **WHEN** a loadsheet reporting any cargo tonnage is submitted
- **THEN** the loadsheet is accepted
