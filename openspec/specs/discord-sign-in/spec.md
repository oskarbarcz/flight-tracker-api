# discord-sign-in Specification

## Purpose
Lets a user obtain a session by proving control of a Discord account that is already
linked to their account, as an alternative to email and password, without ever
creating an account from a Discord identity alone.
## Requirements
### Requirement: A user signs in with a linked Discord account

The system SHALL open a session when presented with a Discord authorization code that
resolves, after the system's own exchange with Discord, to a Discord identifier
already linked to a user. The system SHALL return the same session material as an
email and password sign-in.

#### Scenario: A linked user signs in with Discord

- **WHEN** a Discord authorization code resolving to a linked Discord account is submitted
- **THEN** a session is opened for the linked user and the usual sign-in response is returned

#### Scenario: A rejected authorization code does not sign anybody in

- **WHEN** the submitted authorization code is one Discord rejects
- **THEN** the request is rejected with a validation error and no session is opened

### Requirement: Sign-in resolves a user by Discord identifier only

The system SHALL resolve the user by the Discord identifier alone, and SHALL NOT fall
back to matching the email address reported by Discord, which would let control of an
email address stand in for control of the account. A Discord identity that matches no
linked account SHALL be rejected as unauthorized.

#### Scenario: An unlinked Discord account cannot sign in

- **WHEN** a valid Discord authorization code resolves to a Discord account that no user has linked
- **THEN** the request is rejected as unauthorized

#### Scenario: A matching email address does not grant a session

- **WHEN** a valid Discord authorization code resolves to a Discord account whose email matches an existing user that has not linked it
- **THEN** the request is rejected as unauthorized and no session is opened

### Requirement: Discord sign-in never creates an account

The system SHALL NOT create a user account as a side effect of a Discord sign-in
attempt. Accounts are created only by the existing administrative and registration
paths.

#### Scenario: An unknown Discord identity creates nothing

- **WHEN** a Discord sign-in is attempted with an identity linked to no account
- **THEN** the request is rejected and no user account is created

### Requirement: Sign-in is available without an existing session

The system SHALL accept the Discord sign-in request without an access token, as it is
a way of obtaining one.

#### Scenario: An anonymous caller may attempt Discord sign-in

- **WHEN** a Discord sign-in request is made with no access token
- **THEN** the request is processed on its merits rather than rejected as unauthorized

