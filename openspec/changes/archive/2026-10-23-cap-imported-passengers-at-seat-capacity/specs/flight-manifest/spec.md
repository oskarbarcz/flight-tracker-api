## ADDED Requirements

### Requirement: An imported plan is seated up to the cabin's capacity

The system SHALL seat a flight imported from a flight plan whose passenger count exceeds the seats of
the aircraft's assigned layout with as many passengers as the layout has seats, because the import
caps its preliminary loadsheet at that count. The import SHALL NOT be refused for it, and the
manifest SHALL be generated at import like any other.

#### Scenario: A plan larger than the cabin fills every seat

- **GIVEN** an operations user whose SimBrief plan reports 348 passengers
- **AND** the plan's aircraft has a layout of 220 seats
- **WHEN** they create the flight from that plan
- **THEN** the import succeeds
- **AND** the manifest holds 220 passengers

## MODIFIED Requirements

### Requirement: A passenger count exceeding seat capacity is rejected

The system SHALL reject as unprocessable an attempt by operations to write a preliminary loadsheet
reporting more passengers than the aircraft's layout has seats. The check SHALL apply only when the
aircraft has an assigned layout, and the loadsheet SHALL NOT be stored when it is refused. A loadsheet
imported from a flight plan SHALL be capped at the seat count instead of refused.

#### Scenario: An over-capacity loadsheet is refused

- **GIVEN** a flight whose aircraft has a layout with fewer seats than the loadsheet reports passengers
- **WHEN** operations writes that loadsheet
- **THEN** the request is rejected as unprocessable
- **AND** no manifest is generated

#### Scenario: A loadsheet at exactly capacity is accepted

- **WHEN** a loadsheet reports exactly as many passengers as the layout has seats
- **THEN** the loadsheet is accepted
