# user-profile-self-service Specification

## Purpose

Lets an authenticated user read and maintain their own profile attributes without
administrative help, while keeping role, credentials, and system-managed fields
out of reach of self-service.
## Requirements
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

### Requirement: A user's own details list their addresses with confirmation state

The system SHALL report, when a user reads their own details, every email address the
account holds as a list, each carrying whether control of that address has been
proven and whether the account signs in with it today. The active address SHALL be
the one the account signs in with; a pending address awaiting confirmation SHALL
appear as neither active nor confirmed. The system SHALL keep the single active
address available as its own field, so existing readers are unaffected, and SHALL NOT
expose the moment at which an address was confirmed. Administrative reads of a user
and the user list SHALL keep their existing shape.

#### Scenario: An account with one proven address

- **WHEN** an authenticated user with no pending change reads their own details
- **THEN** the response lists exactly one address, marked active and confirmed

#### Scenario: A pending address is listed as unconfirmed and inactive

- **WHEN** an authenticated user with a pending email change reads their own details
- **THEN** the response lists the current address as active and confirmed, and the pending address as neither

#### Scenario: An address nobody proved is listed as unconfirmed

- **WHEN** an authenticated user whose address was never confirmed reads their own details
- **THEN** the response lists that address as active but not confirmed

#### Scenario: A completed change leaves one confirmed address

- **WHEN** a user confirms an email change and then reads their own details
- **THEN** the response lists only the new address, marked active and confirmed

### Requirement: An address is confirmed only by someone proving they can read it

The system SHALL treat an address as confirmed only when control of it has been proven
by using a link sent to it. An address set on a user's behalf, when an administrator
creates the account, SHALL be unconfirmed. Addresses that existed before confirmation
was recorded SHALL be treated as confirmed.

#### Scenario: An administratively created account starts unconfirmed

- **WHEN** an administrator creates a user and that user reads their own details
- **THEN** their address is listed as not confirmed

#### Scenario: Confirming an email change confirms the address

- **WHEN** a user completes an email change
- **THEN** the address that becomes active is confirmed

### Requirement: Only the account holder can move its address

The system SHALL NOT accept an email address in an administrative update of a user:
once an account exists, its address changes only through a self-service change that
the new address confirmed. An administrative update that supplies an address SHALL be
rejected as a validation error, naming the address field as one that is not accepted,
and SHALL leave the account unchanged.

#### Scenario: An administrative update carrying an address is rejected

- **WHEN** an administrator submits an email address in an update of another user
- **THEN** the request is rejected with a validation error and that user's address is unchanged

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

#### Scenario: A newly pending address shows up immediately

- **WHEN** a user requests an email change and then reads their own details
- **THEN** the response already lists the pending address, with no stale cached copy

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

