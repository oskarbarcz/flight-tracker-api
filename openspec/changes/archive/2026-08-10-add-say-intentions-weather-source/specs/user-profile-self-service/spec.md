## ADDED Requirements

### Requirement: A user's own default weather source is visible only to them

The system SHALL include the default weather source when a user reads their own details
or updates their own profile, and SHALL NOT include it in administrative reads of a user
or in the user list, which keep their existing shape. Every user SHALL have a default
weather source at all times: an account that has never set one SHALL report
`aviation_weather_gov`, so the attribute is never absent or empty.

#### Scenario: The user's own details expose their default weather source

- **WHEN** an authenticated user reads their own details
- **THEN** the response includes their default weather source

#### Scenario: An administrative read does not expose the default weather source

- **WHEN** a user's details are read administratively, or the user list is read
- **THEN** the response does not include the default weather source

#### Scenario: A user who never chose a source has the default one

- **WHEN** an authenticated user who has never set a default weather source reads their own details
- **THEN** the response reports `aviation_weather_gov`

## MODIFIED Requirements

### Requirement: A user updates their own profile

The system SHALL allow any authenticated user to update their own name, pilot
license, home airport, Simbrief user ID, and default weather source, and SHALL return the
updated user. The system SHALL apply the update to the requesting user only, identified
from the access token, and SHALL ignore any user identifier supplied in the request. Fields
omitted from the request SHALL be left unchanged. The default weather source SHALL accept
only a source the system actually collects weather from — `aviation_weather_gov` or
`say_intentions` — and SHALL reject any other value, including the filter-only values
accepted by the weather read endpoint, with a validation error.

#### Scenario: A user changes their own name

- **WHEN** an authenticated user submits a new name for their own profile
- **THEN** the name is updated and the updated user is returned

#### Scenario: A cabin crew member changes their own pilot license

- **WHEN** an authenticated cabin crew member submits a new pilot license identifier
- **THEN** the pilot license is updated and the updated user is returned

#### Scenario: A cabin crew member changes their own home airport

- **WHEN** an authenticated cabin crew member submits a different home airport
- **THEN** the home airport is updated and the updated user is returned

#### Scenario: A user sets their own Simbrief user ID

- **WHEN** an authenticated user submits a Simbrief user ID
- **THEN** the Simbrief user ID is stored and the updated user is returned

#### Scenario: A user chooses their own default weather source

- **WHEN** an authenticated user submits `say_intentions` as their default weather source
- **THEN** the default weather source is updated, the updated user is returned, and subsequent unfiltered weather reads by that user return `say_intentions` reports

#### Scenario: A default weather source outside the collected sources is rejected

- **WHEN** an authenticated user submits `all` or any other value that is not a collected weather source as their default
- **THEN** the request is rejected with a validation error and their default weather source is unchanged

#### Scenario: Omitted fields are preserved

- **WHEN** an authenticated user submits only a new name
- **THEN** their pilot license, home airport, Simbrief user ID, default weather source, and every other profile attribute are unchanged

#### Scenario: An unauthenticated request is rejected

- **WHEN** a request to update a profile carries no access token
- **THEN** the request is rejected as unauthorized and no user is changed

### Requirement: Self-service cannot change privileged or system-managed fields

The system SHALL reject a self-service profile update that attempts to set any
attribute other than the five self-service attributes — in particular `role`,
`email`, `password`, `currentFlightId`, or the last-airport attributes — with a
validation error, and SHALL NOT apply any part of that request.

#### Scenario: A user cannot promote themselves

- **WHEN** an authenticated cabin crew member submits a profile update that also sets their role to an administrative role
- **THEN** the request is rejected with a validation error and neither the role nor any other attribute is changed

#### Scenario: A user cannot change credentials through the profile endpoint

- **WHEN** an authenticated user submits a profile update that also sets a password or an email address
- **THEN** the request is rejected with a validation error and the credentials are unchanged

#### Scenario: A user cannot change operationally derived fields

- **WHEN** an authenticated user submits a profile update that also sets their current flight or their last airport
- **THEN** the request is rejected with a validation error and those fields are unchanged
