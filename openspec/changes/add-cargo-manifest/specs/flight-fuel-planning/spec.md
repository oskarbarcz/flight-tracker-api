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

### Requirement: A loadsheet's payload must reconcile with its passengers and cargo

The system SHALL reject as unprocessable a loadsheet whose payload cannot be reconciled against
its passenger count at the standard adult mass and its cargo tonnage, whether because the residual
left for baggage is negative or because it implies an implausible baggage mass per passenger. Where
the aircraft's airframe type has no curated hold data the payload SHALL NOT be checked.

#### Scenario: A payload smaller than its passengers and cargo is rejected

- **WHEN** a loadsheet is submitted whose payload is less than its passenger count at the standard adult mass plus its cargo tonnage
- **THEN** the request is rejected as unprocessable

#### Scenario: A payload implying an implausible baggage mass is rejected

- **WHEN** a loadsheet is submitted whose residual implies an implausible baggage mass per passenger
- **THEN** the request is rejected as unprocessable

#### Scenario: A reconcilable payload is accepted

- **WHEN** a loadsheet is submitted whose payload leaves a plausible baggage residual
- **THEN** the loadsheet is accepted

#### Scenario: A cargo flight carrying no passengers is reconciled without baggage

- **WHEN** a loadsheet reporting no passengers is submitted
- **THEN** the payload is reconciled against the cargo tonnage alone
