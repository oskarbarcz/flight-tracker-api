## MODIFIED Requirements

### Requirement: A user updates their own profile

The system SHALL allow any authenticated user to update their own name, pilot license, home airport, Simbrief user ID, and default weather source, and SHALL return the updated user. The system SHALL apply the update to the requesting user only, identified from the access token, and SHALL ignore any user identifier supplied in the request. Fields omitted from the request SHALL be left unchanged. The default weather source SHALL accept only a source the system actually collects weather from — `aviation_weather_gov` or `say_intentions` — and SHALL reject any other value, including the filter-only values accepted by the weather read endpoint, with a validation error. The Simbrief user ID SHALL consist of digits only, since that is what SimBrief issues, and SHALL be rejected with a validation error otherwise; a well-formed ID SHALL additionally be verified against SimBrief before it is stored.

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

- **WHEN** an authenticated user submits a Simbrief user ID that SimBrief knows
- **THEN** the Simbrief user ID is stored and the updated user is returned

#### Scenario: A Simbrief user ID that is not a number is rejected

- **WHEN** an authenticated user submits a Simbrief user ID containing anything other than digits
- **THEN** the request is rejected with a validation violation naming the field, their stored ID is unchanged, and SimBrief is not asked about it

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
- **THEN** the request is rejected as unauthorized
