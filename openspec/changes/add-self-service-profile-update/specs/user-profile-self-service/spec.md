## Purpose

Lets an authenticated user read and maintain their own profile attributes without
administrative help, while keeping role, credentials, and system-managed fields
out of reach of self-service.

## ADDED Requirements

### Requirement: A user updates their own profile

The system SHALL allow any authenticated user to update their own `name` and
`pilotLicenseId` and SHALL return the updated user. The system SHALL apply the
update to the requesting user only, identified from the access token, and SHALL
ignore any user identifier supplied in the request. Fields omitted from the
request SHALL be left unchanged.

#### Scenario: A user changes their own name

- **WHEN** an authenticated user submits a new name for their own profile
- **THEN** the name is updated and the updated user is returned

#### Scenario: A cabin crew member changes their own pilot license

- **WHEN** an authenticated cabin crew member submits a new pilot license identifier
- **THEN** the pilot license is updated and the updated user is returned

#### Scenario: Omitted fields are preserved

- **WHEN** an authenticated user submits only a new name
- **THEN** their pilot license and every other profile attribute are unchanged

#### Scenario: An unauthenticated request is rejected

- **WHEN** a request to update a profile carries no access token
- **THEN** the request is rejected as unauthorized and no user is changed

### Requirement: Self-service cannot change privileged or system-managed fields

The system SHALL reject a self-service profile update that attempts to set any
attribute other than `name` and `pilotLicenseId` — in particular `role`, `email`,
`password`, `homeAirportId`, `simbriefUserId`, `currentFlightId`, or the last-airport
attributes — with a validation error, and SHALL NOT apply any part of that request.

#### Scenario: A user cannot promote themselves

- **WHEN** an authenticated cabin crew member submits a profile update that also sets their role to an administrative role
- **THEN** the request is rejected with a validation error and neither the role nor any other attribute is changed

#### Scenario: A user cannot change credentials through the profile endpoint

- **WHEN** an authenticated user submits a profile update that also sets a password or an email address
- **THEN** the request is rejected with a validation error and the credentials are unchanged

### Requirement: Profile updates honour the pilot license rules

The system SHALL reject a self-service profile update that sets a
`pilotLicenseId` on a user who is not cabin crew. The system SHALL reject a
`pilotLicenseId` that does not match the required license format.

#### Scenario: A non-cabin-crew user cannot hold a pilot license

- **WHEN** an authenticated user whose role is not cabin crew submits a pilot license identifier
- **THEN** the request is rejected and the profile is unchanged

#### Scenario: A malformed pilot license is rejected

- **WHEN** an authenticated cabin crew member submits a pilot license identifier that does not match the required format
- **THEN** the request is rejected with a validation error and the profile is unchanged

### Requirement: Updated profile data is immediately visible

The system SHALL ensure that a successful self-service profile update is
immediately reflected by subsequent reads of the current user and of the user's
public pilot card, with no stale cached values.

#### Scenario: The current-user read reflects the update

- **WHEN** a user updates their own name and then reads their current user details
- **THEN** the response shows the new name

#### Scenario: The pilot card reflects the update

- **WHEN** a cabin crew member updates their own name and pilot license and their pilot card is then read
- **THEN** the pilot card shows the new name and pilot license
