## ADDED Requirements

### Requirement: Filter the rotation list by state

The system SHALL list an operator's rotations and SHALL allow the list to be
filtered by rotation state via an optional `status` parameter. When `status` is
omitted, all of the operator's rotations are returned; when provided, only rotations
in that state are returned; an unrecognised state is rejected as a bad request.

#### Scenario: Listing without a filter returns every rotation

- **WHEN** a caller lists an operator's rotations without a status filter
- **THEN** all of that operator's rotations are returned

#### Scenario: Filtering by state returns only matching rotations

- **WHEN** a caller lists an operator's rotations with a status of `ready`
- **THEN** only that operator's rotations in the `ready` state are returned

#### Scenario: An unrecognised state is rejected

- **WHEN** a caller lists an operator's rotations with a status that is not a valid rotation state
- **THEN** the request is rejected as a bad request
