## Purpose

Lets a user see every place their account is currently signed in and end any of them
individually, so that a long-lived session on a machine they no longer control can be
cut off without changing their password.

## ADDED Requirements

### Requirement: A session records what opened it

The system SHALL record, for every session it opens, the name of the client that
opened it, a label describing the device where available, the originating IP address,
and the time the session was last used. The system SHALL record these for sessions
opened by password, Google and Discord sign-in as well as by a device authorization, so
that no open session is unattributable.

#### Scenario: A web sign-in is attributed

- **WHEN** a user signs in through the web application
- **THEN** the resulting session records a client name, a device label derived from the request, and the originating IP address

#### Scenario: A device link is attributed

- **WHEN** a device authorization is approved and its session issued
- **THEN** the resulting session records the client name and device label the device supplied

### Requirement: Refreshing a session updates when it was last used

The system SHALL update a session's last-used time whenever it is refreshed, so that
the listing distinguishes a session in daily use from one dormant since it was opened.

#### Scenario: A refresh advances the last-used time

- **WHEN** a session is refreshed
- **THEN** its recorded last-used time reflects the refresh

### Requirement: A user lists their own open sessions

The system SHALL return, to an authenticated user, every session currently open on
their account, each with its identifier, client name, device label, IP address,
creation time, last-used time, expiry, and whether it is the session making the
request. The system SHALL NOT return any token or token hash in the listing.

#### Scenario: A user reads their open sessions

- **WHEN** an authenticated user lists their sessions
- **THEN** every open session on the account is returned with its attributes, and the session making the request is marked as such

#### Scenario: The listing never carries token material

- **WHEN** an authenticated user lists their sessions
- **THEN** no response field contains a refresh token or a hash of one

#### Scenario: Listing sessions requires a session

- **WHEN** sessions are listed with no access token
- **THEN** the request is rejected as unauthorized

### Requirement: A user revokes a named session

The system SHALL revoke a session the requesting user owns when they name it, after
which that session can no longer be refreshed. Revocation SHALL be immediate and SHALL
NOT require a password change.

#### Scenario: Revoking a session ends it

- **WHEN** an authenticated user revokes another of their open sessions
- **THEN** that session can no longer be refreshed

#### Scenario: A revoked device stops working

- **WHEN** a user revokes the session belonging to a linked device
- **THEN** the device's next refresh is rejected as unauthorized and it must be authorized again to return

### Requirement: A user cannot revoke the session making the request

The system SHALL reject an attempt to revoke the session the request is authenticated
with, and SHALL point at signing out as the way to end the current session, so that a
client cannot destroy its own session through a path that leaves it unable to react.

#### Scenario: Revoking the acting session is refused

- **WHEN** an authenticated user names their own current session for revocation
- **THEN** the request is rejected and the session remains valid

### Requirement: A user cannot see or revoke another user's session

The system SHALL scope both listing and revocation to the requesting user's own
sessions, and SHALL answer a request naming a session belonging to somebody else as
though that session did not exist, rather than confirming it does.

#### Scenario: Another user's session cannot be revoked

- **WHEN** an authenticated user names a session belonging to a different user
- **THEN** the request is rejected as not found and that session remains valid

### Requirement: A session's lifetime depends on the client that opened it

The system SHALL give a session opened through a device authorization a refresh
lifetime of at least sixty days, and SHALL keep the shorter lifetime for sessions
opened through the web application, because a companion application used only when its
owner flies would otherwise be signed out between uses while a browser session gains
nothing from lasting as long. The lifetime recorded with the stored session and the
lifetime carried by the refresh token itself SHALL always agree.

#### Scenario: A device session outlives a web session

- **WHEN** a device authorization is approved and a web sign-in happens at the same moment
- **THEN** the device session's refresh lifetime is at least sixty days and the web session's is the shorter one

#### Scenario: The stored and issued lifetimes agree

- **WHEN** any session is opened or refreshed
- **THEN** the expiry recorded for the session matches the expiry carried by the refresh token
