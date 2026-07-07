## ADDED Requirements

### Requirement: Aircraft carries an ETOPS certification threshold

The system SHALL store on each aircraft an optional ETOPS certification threshold,
`etopsThresholdMinutes`, where `NULL` means the aircraft is not ETOPS-certified and a
non-null value SHALL be one of `60`, `75`, `90`, `120`, or `180` minutes. No other
values SHALL be accepted.

#### Scenario: A certified aircraft stores its threshold

- **WHEN** an aircraft is assigned an ETOPS threshold of a permitted value
- **THEN** the aircraft's `etopsThresholdMinutes` is that value

#### Scenario: A non-certified aircraft has no threshold

- **WHEN** an aircraft has no ETOPS certification
- **THEN** its `etopsThresholdMinutes` is `NULL`

#### Scenario: Invalid threshold values are rejected

- **WHEN** an ETOPS threshold that is not one of `60/75/90/120/180` is submitted
- **THEN** the system rejects the request with a validation error

### Requirement: Operations set the ETOPS threshold at creation or edit

The system SHALL allow the ETOPS threshold to be set when an aircraft is created and to
be set or cleared through the edit-aircraft endpoint, both restricted to the operations
role. The threshold SHALL be included in aircraft read responses.

#### Scenario: Operations sets the threshold at creation

- **WHEN** an operations user creates an aircraft with a permitted ETOPS threshold
- **THEN** the created aircraft has that threshold

#### Scenario: Operations sets the threshold on edit

- **WHEN** an operations user edits an aircraft with a permitted ETOPS threshold
- **THEN** the aircraft's threshold is updated
- **AND** subsequent reads of the aircraft return the new threshold

#### Scenario: Non-operations user cannot set the threshold

- **WHEN** a user without the operations role attempts to set the ETOPS threshold
- **THEN** the system responds with 403 Forbidden
