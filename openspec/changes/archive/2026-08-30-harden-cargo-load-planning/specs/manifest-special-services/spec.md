## MODIFIED Requirements

### Requirement: Special service codes survive reconciliation

The system SHALL leave the special service code of a passenger who remains on the manifest
unchanged when boarding is finished, and SHALL assign codes to newly generated passengers on
the same basis as at generation.

#### Scenario: A remaining passenger keeps their code

- **GIVEN** a flight whose manifest contains passengers carrying special service codes
- **WHEN** boarding is finished with a different passenger count
- **THEN** every passenger who remains keeps the code they had

#### Scenario: Added passengers may carry codes

- **WHEN** reconciliation generates additional passengers
- **THEN** those passengers carry codes on the same basis as passengers seated from the preliminary loadsheet
