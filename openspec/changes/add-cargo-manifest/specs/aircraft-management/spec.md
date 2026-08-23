## ADDED Requirements

### Requirement: Aircraft read models expose the assigned hold variant

The system SHALL include the assigned hold variant in every response carrying a full aircraft
body, using the field name `holdVariant`, reporting null where none is assigned. This covers the
aircraft list, the single aircraft read, and the aircraft body returned by the assignment
actions. A null value SHALL be understood as the aircraft using its airframe
type's default hold variant, not as the aircraft having no hold. The abbreviated aircraft body
embedded in a flight is out of scope here and gains its cargo information with the cargo
manifest.

#### Scenario: Single aircraft read

- **WHEN** an authenticated user requests a single aircraft
- **THEN** the response body includes `holdVariant`

#### Scenario: Aircraft list

- **WHEN** an authenticated user lists aircraft
- **THEN** every aircraft in the returned list includes `holdVariant`

#### Scenario: An aircraft with no assignment reports null

- **GIVEN** an aircraft to which no hold variant has been assigned
- **WHEN** it is read
- **THEN** `holdVariant` is null

### Requirement: Hold variant assignment is not part of creating or editing an aircraft

The system SHALL NOT accept a hold variant when an aircraft is created or edited, keeping
assignment to its own request, so that the aircraft write endpoints remain unchanged.

#### Scenario: Creating an aircraft ignores a hold variant

- **WHEN** an aircraft is created with a hold variant in the request body
- **THEN** the aircraft is created with no hold variant assigned

#### Scenario: Editing an aircraft ignores a hold variant

- **WHEN** an aircraft is edited with a hold variant in the request body
- **THEN** the aircraft's assigned hold variant is unchanged
