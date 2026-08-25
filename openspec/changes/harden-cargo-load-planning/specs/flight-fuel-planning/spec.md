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
