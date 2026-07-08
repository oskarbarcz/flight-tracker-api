## ADDED Requirements

### Requirement: Imported crew are linked to their flight

When crew are imported for a flight from SimBrief, the system SHALL link each imported crew member (first officer, purser, and every flight attendant) to that flight. The link MUST be created as part of the same synchronous flight-creation flow, so the flight's crew are retrievable as soon as creation returns.

#### Scenario: Roster is linked to the flight it was imported for

- **WHEN** a flight is created from a SimBrief OFP containing a crew roster
- **THEN** each imported crew member is linked to that flight
- **AND** the captain and dispatcher are neither imported nor linked

### Requirement: A flight's crew can be listed

The system SHALL expose an authenticated endpoint `GET /api/v1/flight/{flightId}/crew` returning the crew on the given flight, each with their `id`, `name`, `email`, `role`, and `operatorId`.

#### Scenario: List a flight's crew

- **WHEN** an authenticated user requests `GET /api/v1/flight/{flightId}/crew` for a flight that has crew
- **THEN** the response contains exactly the crew members linked to that flight

#### Scenario: Flight has no crew

- **WHEN** an authenticated user requests `GET /api/v1/flight/{flightId}/crew` for a flight with no linked crew
- **THEN** the response is an empty list

#### Scenario: Unknown flight

- **WHEN** an authenticated user requests `GET /api/v1/flight/{flightId}/crew` for a flight that does not exist
- **THEN** the request is rejected as not found

#### Scenario: Unauthenticated request is rejected

- **WHEN** an unauthenticated client requests `GET /api/v1/flight/{flightId}/crew`
- **THEN** the request is rejected as unauthorized

### Requirement: Operations can assign a crew member to a flight

The system SHALL allow a user with the `operations` role to add a crew member to a flight via `POST /api/v1/flight/{flightId}/crew` with body `{ crewId }`. The crew member MUST already exist and MUST belong to the flight's operator. On success the crew member is linked to the flight and appears in the flight's crew list.

#### Scenario: Assign an operator's crew member to its flight

- **WHEN** operations posts a `crewId` of a crew member belonging to the flight's operator
- **THEN** the crew member is linked to the flight and returned in the flight's crew list

#### Scenario: Assigning the same crew member twice is idempotent

- **WHEN** operations assigns a crew member already linked to the flight
- **THEN** no duplicate link is created and the flight's crew list is unchanged

#### Scenario: Crew member of a different operator is rejected

- **WHEN** operations posts a `crewId` belonging to a different operator than the flight's
- **THEN** the request is rejected and no link is created

#### Scenario: Unknown flight or crew member is rejected

- **WHEN** operations posts a `crewId` that does not exist, or targets a flight that does not exist
- **THEN** the request is rejected as not found

#### Scenario: Non-operations user cannot assign crew

- **WHEN** a user without the `operations` role posts to `POST /api/v1/flight/{flightId}/crew`
- **THEN** the request is rejected as forbidden

### Requirement: Operations can remove a crew member from a flight

The system SHALL allow a user with the `operations` role to remove a crew member from a flight via `DELETE /api/v1/flight/{flightId}/crew/{crewId}`. Removing the link MUST NOT delete the crew record itself.

#### Scenario: Remove a crew member from a flight

- **WHEN** operations deletes a crew member's link from a flight
- **THEN** the crew member no longer appears in the flight's crew list
- **AND** the crew member remains listed under its operator

#### Scenario: Non-operations user cannot remove crew

- **WHEN** a user without the `operations` role deletes a crew link
- **THEN** the request is rejected as forbidden

### Requirement: Flight-crew links are removed when the flight is deleted

The system SHALL remove a flight's crew links when the flight is deleted. Deleting a flight MUST NOT delete the crew records themselves — only the links.

#### Scenario: Deleting a flight removes its crew links

- **WHEN** a flight with linked crew is deleted
- **THEN** the flight's crew links are removed
- **AND** the crew members remain listed under their operator
