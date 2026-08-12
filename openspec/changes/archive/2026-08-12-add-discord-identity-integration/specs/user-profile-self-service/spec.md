## MODIFIED Requirements

### Requirement: Self-service cannot change privileged or system-managed fields

The system SHALL reject a self-service profile update that attempts to set any
attribute other than the five self-service attributes — in particular `role`,
`email`, `password`, `discordId`, `currentFlightId`, or the last-airport attributes —
with a validation error, and SHALL NOT apply any part of that request. The Discord
identifier is an authentication identifier, so it SHALL be writable only by a
completed Discord authorization exchange and never by a value the client supplies.

#### Scenario: A user cannot promote themselves

- **WHEN** an authenticated cabin crew member submits a profile update that also sets their role to an administrative role
- **THEN** the request is rejected with a validation error and neither the role nor any other attribute is changed

#### Scenario: A user cannot change credentials through the profile endpoint

- **WHEN** an authenticated user submits a profile update that also sets a password or an email address
- **THEN** the request is rejected with a validation error and the credentials are unchanged

#### Scenario: A user cannot claim a Discord identity through the profile endpoint

- **WHEN** an authenticated user submits a profile update that also sets a Discord identifier
- **THEN** the request is rejected with a validation error and the linked Discord account is unchanged

#### Scenario: A user cannot change operationally derived fields

- **WHEN** an authenticated user submits a profile update that also sets their current flight or their last airport
- **THEN** the request is rejected with a validation error and those fields are unchanged

## ADDED Requirements

### Requirement: A user's own details report their linked identity providers

The system SHALL report, when a user reads their own details, each supported identity
provider and whether an account is linked to it, answering from stored attributes
alone without contacting the provider. A linked Discord provider SHALL carry the
Discord user identifier, username, display name and avatar URL; a linked Google
provider SHALL carry the Google email address. Administrative reads of a user and the
user list SHALL keep their existing shape.

#### Scenario: A user with a linked Discord account sees it

- **WHEN** an authenticated user with a linked Discord account reads their own details
- **THEN** the response reports the Discord provider as linked, with the Discord user identifier, username, display name and avatar URL

#### Scenario: A user with no linked accounts sees both providers as unlinked

- **WHEN** an authenticated user who linked neither provider reads their own details
- **THEN** the response reports both the Google and the Discord provider as not linked

#### Scenario: Reading the identities contacts nobody

- **WHEN** an authenticated user reads their own details
- **THEN** the linked identity information is answered from stored attributes without any request to Discord or Google

#### Scenario: An administrative read does not expose the identities

- **WHEN** a user's details are read administratively, or the user list is read
- **THEN** the response does not include the linked identity providers
