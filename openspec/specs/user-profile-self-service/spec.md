# user-profile-self-service Specification

## Purpose

Lets an authenticated user read and maintain their own profile attributes without
administrative help, while keeping role, credentials, and system-managed fields
out of reach of self-service.

## Requirements

### Requirement: A user updates their own profile

The system SHALL allow any authenticated user to update their own name, pilot
license, home airport, and Simbrief user ID, and SHALL return the updated user. The
system SHALL apply the update to the requesting user only, identified from the access
token, and SHALL ignore any user identifier supplied in the request. Fields omitted
from the request SHALL be left unchanged.

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

#### Scenario: Omitted fields are preserved

- **WHEN** an authenticated user submits only a new name
- **THEN** their pilot license, home airport, Simbrief user ID, and every other profile attribute are unchanged

#### Scenario: An unauthenticated request is rejected

- **WHEN** a request to update a profile carries no access token
- **THEN** the request is rejected as unauthorized and no user is changed

### Requirement: Self-service cannot change privileged or system-managed fields

The system SHALL reject a self-service profile update that attempts to set any
attribute other than the four self-service attributes — in particular `role`,
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

### Requirement: Profile updates honour the pilot license rules

The system SHALL reject a self-service profile update that sets a
`pilotLicenseId` on a user who is not cabin crew. The system SHALL reject a
`pilotLicenseId` that does not match the required license format. A cabin crew member
SHALL be able to clear their own pilot license.

#### Scenario: A non-cabin-crew user cannot hold a pilot license

- **WHEN** an authenticated user whose role is not cabin crew submits a pilot license identifier
- **THEN** the request is rejected and the profile is unchanged

#### Scenario: A malformed pilot license is rejected

- **WHEN** an authenticated cabin crew member submits a pilot license identifier that does not match the required format
- **THEN** the request is rejected with a validation error and the profile is unchanged

#### Scenario: A cabin crew member clears their pilot license

- **WHEN** an authenticated cabin crew member submits an empty pilot license
- **THEN** the pilot license is cleared

### Requirement: Profile updates honour the home airport rules

The system SHALL reject a self-service profile update that sets a home airport on a
user who is not cabin crew. The system SHALL reject a home airport that is not a
valid identifier, and SHALL reject an attempt to clear a home airport, since a cabin
crew member must always have one. The system SHALL reject a home airport that does
not identify an existing airport, reporting it as not found, and SHALL apply no part
of the update in that case. This rule SHALL hold on every path that writes a user's
home airport, administrative ones included.

#### Scenario: A non-cabin-crew user cannot hold a home airport

- **WHEN** an authenticated user whose role is not cabin crew submits a home airport
- **THEN** the request is rejected and the profile is unchanged

#### Scenario: A cabin crew member cannot clear their home airport

- **WHEN** an authenticated cabin crew member submits an empty home airport
- **THEN** the request is rejected with a validation error and the home airport is unchanged

#### Scenario: A malformed home airport is rejected

- **WHEN** an authenticated user submits a home airport that is not a valid identifier
- **THEN** the request is rejected with a validation error and the profile is unchanged

#### Scenario: A home airport that does not exist is rejected

- **WHEN** an authenticated cabin crew member submits a well-formed identifier for an airport that does not exist
- **THEN** the request is rejected as not found and the home airport is unchanged

#### Scenario: An administrator cannot set a home airport that does not exist

- **WHEN** an administrator creates or updates a user with a well-formed identifier for an airport that does not exist
- **THEN** the request is rejected as not found and no user is created or changed

### Requirement: A user's own Simbrief user ID is visible only to them

The system SHALL include the Simbrief user ID when a user reads their own details or
updates their own profile. The system SHALL NOT include it in administrative reads of
a user or in the user list, which keep their existing shape.

#### Scenario: The user's own details expose their Simbrief user ID

- **WHEN** an authenticated user reads their own details
- **THEN** the response includes their Simbrief user ID

#### Scenario: An administrative read does not expose the Simbrief user ID

- **WHEN** a user's details are read administratively, or the user list is read
- **THEN** the response does not include the Simbrief user ID

### Requirement: Updated profile data is immediately visible

The system SHALL ensure that a successful self-service profile update is
immediately reflected by subsequent reads of the current user, with no stale cached
values. The system SHALL likewise discard any cached copy of the user's public pilot
card, so that the name and pilot license shown to other users are rebuilt from the
updated profile.

#### Scenario: The current-user read reflects the update

- **WHEN** a user updates their own name and then reads their current user details
- **THEN** the response shows the new name

#### Scenario: The pilot card is rebuilt after an update

- **WHEN** a cabin crew member updates their own name and pilot license
- **THEN** the cached pilot card is discarded, so the next read of it reports the new name and pilot license
