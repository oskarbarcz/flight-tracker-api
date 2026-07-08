## ADDED Requirements

### Requirement: Crew are operator-owned ambient records

The system SHALL persist crew as records owned by an operator, each with an `id`, `name`, `email`, `operatorId`, `role`, and `createdAt`. A crew member's `role` MUST be one of `fo` (first officer), `pu` (purser), or `fa` (flight attendant). Crew are non-player characters and MUST NOT be able to authenticate — they are not users.

#### Scenario: Crew record belongs to an operator

- **WHEN** a crew member is created
- **THEN** it references the owning operator via `operatorId`
- **AND** it carries a `role` of `fo`, `pu`, or `fa`
- **AND** it carries a `createdAt` timestamp

#### Scenario: Crew cannot sign in

- **WHEN** the system stores a crew member
- **THEN** no authentication credentials are created for that crew member

### Requirement: Crew are imported from the SimBrief roster on flight creation

When a flight is created from SimBrief, the system SHALL import the flight's crew roster from the OFP `crew` object. It MUST import the first officer (`fo`), the purser (`pu`), and every flight attendant (`fa[]`). It MUST NOT import the captain (`cpt`, who is the live player) nor the dispatcher (`dx`, who is not aircraft crew).

#### Scenario: Roster is imported for the flight's operator

- **WHEN** a flight is created from a SimBrief OFP containing a crew roster
- **THEN** the `fo`, `pu`, and each `fa` entry are stored as crew of the flight's operator with the matching role

#### Scenario: Captain and dispatcher are excluded

- **WHEN** a SimBrief OFP is imported
- **THEN** no crew record is created for the `cpt` value
- **AND** no crew record is created for the `dx` value

### Requirement: Crew import is idempotent

The system SHALL match an incoming crew member against existing crew by `(operatorId, role, name)`. When a match exists it MUST leave the existing record unchanged; when no match exists it MUST create a new record. Re-importing the same roster MUST NOT create duplicates.

#### Scenario: Existing crew member is not duplicated

- **WHEN** a crew member with the same operator, role, and name already exists
- **THEN** no new record is created and the existing record is left unchanged

#### Scenario: New crew member is created

- **WHEN** a crew member with a given operator, role, and name does not yet exist
- **THEN** a new crew record is created

#### Scenario: Re-importing the same flight roster is a no-op

- **WHEN** the same SimBrief roster is imported a second time for the same operator
- **THEN** the operator's crew count is unchanged

### Requirement: Crew name and email are derived from the roster

The system SHALL store each crew member's `name` title-cased (e.g. the OFP value `VIRGIL RIVERS` is stored as `Virgil Rivers`). It SHALL derive the `email` as `{first}.{last}@{operatorShortName}.com`, lowercased, where `first` and `last` are the first and last name tokens and `operatorShortName` is the owning operator's short name slugified (lowercased, non-alphanumeric characters removed).

#### Scenario: Name is title-cased

- **WHEN** the OFP crew name is `VIRGIL RIVERS`
- **THEN** the stored `name` is `Virgil Rivers`

#### Scenario: Email is derived from name and operator short name

- **WHEN** `Virgil Rivers` is imported for an operator whose short name slug is `lufthansa`
- **THEN** the stored `email` is `virgil.rivers@lufthansa.com`

### Requirement: SimBrief crew import completes synchronously with flight creation

The system SHALL complete the crew import as part of the SimBrief flight-creation flow, blocking until every crew member has been created or matched before the flight-creation request returns.

#### Scenario: Crew are queryable immediately after flight creation

- **WHEN** a create-flight-from-SimBrief request returns successfully
- **THEN** the imported crew are already retrievable for the flight's operator

### Requirement: Operator crew can be listed

The system SHALL expose an authenticated endpoint `GET /api/v1/operator/{operatorId}/crew` that returns all crew belonging to the given operator.

#### Scenario: List an operator's crew

- **WHEN** an authenticated user requests `GET /api/v1/operator/{operatorId}/crew`
- **THEN** the response contains every crew member owned by that operator with their `id`, `name`, `email`, `role`, and `operatorId`

#### Scenario: Unauthenticated request is rejected

- **WHEN** an unauthenticated client requests `GET /api/v1/operator/{operatorId}/crew`
- **THEN** the request is rejected as unauthorized
