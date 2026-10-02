## ADDED Requirements

### Requirement: An accepted crew proposal leaves the grade as it was

The system SHALL treat an airport change applied by accepting a crew proposal as an ordinary write
to the airport, so the airport's data quality grade SHALL be the same after the acceptance as it
was before, whatever fields the proposal changed.

#### Scenario: Accepting a proposal does not grade the airport

- **GIVEN** an airport graded `low` and a pending crew proposal that changes its shape and location
- **WHEN** an operations user accepts the proposal
- **THEN** the airport reports the proposed shape and location and its grade is still `low`

#### Scenario: Accepting a proposal does not lower a flagship airport

- **GIVEN** an airport graded `flagship` and a pending crew proposal that changes its timezone
- **WHEN** an admin accepts the proposal
- **THEN** the airport reports the proposed timezone and its grade is still `flagship`
