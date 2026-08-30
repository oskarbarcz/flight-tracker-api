## ADDED Requirements

### Requirement: A loadsheet payload accounts for its cargo and its passengers

The system SHALL reject as unprocessable a loadsheet whose payload is smaller than its cargo
tonnage plus its passengers at the standard adult mass, because a payload that cannot contain
the load it declares is not a loadsheet a flight can be planned from. The check SHALL apply to
the preliminary and the final loadsheet alike, and a payload that accounts for the load exactly
SHALL be accepted.

#### Scenario: A payload smaller than the cargo it carries is rejected

- **GIVEN** a loadsheet reporting a payload of 4 tons and a cargo tonnage of 7 tons
- **WHEN** it is submitted
- **THEN** the request is rejected as unprocessable

#### Scenario: A payload that cannot carry its passengers is rejected

- **GIVEN** a loadsheet whose payload, less its cargo, is smaller than its passengers at the standard adult mass
- **WHEN** it is submitted
- **THEN** the request is rejected as unprocessable

#### Scenario: A payload accounting for the load exactly is accepted

- **GIVEN** a loadsheet whose payload equals its cargo plus its passengers at the standard adult mass
- **WHEN** it is submitted
- **THEN** the loadsheet is accepted

#### Scenario: The final loadsheet is checked on the same terms

- **GIVEN** a final loadsheet whose payload is smaller than its cargo tonnage
- **WHEN** boarding is finished with it
- **THEN** the request is rejected as unprocessable
- **AND** the flight is not closed for boarding

## MODIFIED Requirements

### Requirement: The loadsheet may carry a passenger breakdown per cabin class

The system SHALL accept on a loadsheet an optional breakdown of the passenger count per cabin
class, keyed as the aircraft's cabin layout names them. Every count SHALL be a whole number of
zero or more, and a breakdown carrying anything else SHALL be rejected as a malformed request
naming the offending field, because a fractional or negative passenger is a mistake in the
request rather than a judgement about the flight. Where the breakdown is given its values SHALL
sum to the loadsheet's passenger count, and a breakdown that does not SHALL be rejected as
unprocessable. Where it is omitted the loadsheet SHALL remain valid, and the passenger count
alone SHALL be authoritative.

#### Scenario: A loadsheet without a breakdown remains valid

- **WHEN** a loadsheet is submitted carrying only a passenger count
- **THEN** the loadsheet is accepted

#### Scenario: A consistent breakdown is accepted

- **WHEN** a loadsheet is submitted whose per-class passenger counts sum to its passenger count
- **THEN** the loadsheet is accepted and the breakdown is stored

#### Scenario: An inconsistent breakdown is rejected

- **WHEN** a loadsheet is submitted whose per-class passenger counts do not sum to its passenger count
- **THEN** the request is rejected as unprocessable

#### Scenario: A count that is not a whole number of zero or more is refused

- **WHEN** a loadsheet is submitted whose breakdown carries a negative or fractional count
- **THEN** the request is rejected as malformed, naming the breakdown as the offending field

#### Scenario: A breakdown is reported on reads

- **GIVEN** a flight whose loadsheet carries a per-class breakdown
- **WHEN** the loadsheet is read
- **THEN** the breakdown is reported alongside the passenger count
