## ADDED Requirements

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

## MODIFIED Requirements

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
