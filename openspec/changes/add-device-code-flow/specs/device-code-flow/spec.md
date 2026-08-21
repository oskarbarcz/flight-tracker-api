## Purpose

Lets an application running on a user's own machine obtain a session without ever
handling the user's credentials, by having the user approve the device in a browser
where every sign-in method is already available.

## ADDED Requirements

### Requirement: A device obtains a user code and a device code

The system SHALL issue, to an unauthenticated caller that identifies itself with a
client name and an optional device label, a pending device authorization consisting of
a device code known only to that caller, a short user code shown to the person, a
verification URL, a pre-filled verification URL carrying the user code, the polling
interval the caller must respect, and the number of seconds until the authorization
expires. The device code SHALL NOT be derivable from the user code.

#### Scenario: A device starts an authorization

- **WHEN** a client requests a device code with a client name and a device label
- **THEN** a pending authorization is created and a device code, user code, verification URL, pre-filled verification URL, polling interval and expiry are returned

#### Scenario: Starting an authorization requires no access token

- **WHEN** a device code is requested with no access token
- **THEN** the request succeeds, as the flow exists to obtain one

### Requirement: The user code is short and safe to transcribe by hand

The system SHALL compose the user code from an alphabet that excludes characters
readers confuse with one another, SHALL exclude vowels so that no code spells a word,
and SHALL make the code short enough to read aloud and type. The system SHALL reject a
submitted user code case-insensitively and ignoring any grouping separator, so that a
person typing what they see is not defeated by presentation.

#### Scenario: A code is matched regardless of case and separators

- **WHEN** a user submits a valid user code in lower case and without its separator
- **THEN** the pending authorization is found

#### Scenario: An unknown code is not found

- **WHEN** a user submits a user code that matches no pending authorization
- **THEN** the request is rejected as not found

### Requirement: A signed-in user reviews what they are about to approve

The system SHALL return, to an authenticated user presenting a user code, the client
name, device label, originating IP address and request time of the pending
authorization, so the user can judge whether the request is their own. The system SHALL
require an authenticated user, since approval binds the device to an account.

#### Scenario: A signed-in user reads the pending device's details

- **WHEN** an authenticated user requests a pending authorization by its user code
- **THEN** the client name, device label, IP address and request time are returned

#### Scenario: Reviewing a pending device requires a session

- **WHEN** a pending authorization is requested with no access token
- **THEN** the request is rejected as unauthorized

### Requirement: A user approves or denies a pending device

The system SHALL bind a pending authorization to the approving user's account on
approval, and SHALL mark it denied on denial. Only a pending authorization SHALL be
approvable or deniable; one already approved, denied, consumed or expired SHALL be
rejected.

#### Scenario: A user approves a pending device

- **WHEN** an authenticated user approves a pending authorization
- **THEN** the authorization is bound to that user and marked approved

#### Scenario: A user denies a pending device

- **WHEN** an authenticated user denies a pending authorization
- **THEN** the authorization is marked denied and no session is ever issued for it

#### Scenario: An already-decided authorization cannot be decided again

- **WHEN** a user approves an authorization that was already denied
- **THEN** the request is rejected and the earlier decision stands

### Requirement: Polling reports the authorization's state and finally the session

The system SHALL answer a poll carrying a valid device code with the authorization's
current state: still awaiting the user, denied by the user, expired, or approved. On
approval the response SHALL additionally carry the session material an ordinary
sign-in returns. A poll carrying an unrecognised device code SHALL be rejected as
unauthorized.

#### Scenario: Polling before a decision reports pending

- **WHEN** a device polls with a valid device code and the user has not yet decided
- **THEN** the response reports that authorization is still pending and carries no session material

#### Scenario: Polling after approval returns the session

- **WHEN** a device polls with a valid device code after the user approved it
- **THEN** the response reports approval and carries an access token and a refresh token for the approving user

#### Scenario: Polling after denial reports denial

- **WHEN** a device polls with a valid device code after the user denied it
- **THEN** the response reports that access was denied and carries no session material

#### Scenario: An unknown device code is unauthorized

- **WHEN** a poll is made with a device code that matches no authorization
- **THEN** the request is rejected as unauthorized

### Requirement: An approval yields exactly one session

The system SHALL consume a device authorization on the first poll that returns session
material, and SHALL treat every later poll with the same device code as expired. A
replayed device code SHALL NOT produce a second session.

#### Scenario: A device code cannot be redeemed twice

- **WHEN** a device polls a second time with a device code that already returned a session
- **THEN** the response reports the authorization as expired and no further session is issued

### Requirement: A device authorization expires

The system SHALL treat a device authorization as expired once its expiry time has
passed, whether or not any background process has run, and SHALL report expiry to a
polling device and refuse approval or denial of it. Expiry SHALL be short enough to
bound the window in which a code obtained by deception can still be approved.

#### Scenario: Polling an expired authorization reports expiry

- **WHEN** a device polls with a device code whose authorization has passed its expiry time
- **THEN** the response reports the authorization as expired

#### Scenario: An expired authorization cannot be approved

- **WHEN** a user approves an authorization whose expiry time has passed
- **THEN** the request is rejected and no session is created

### Requirement: A device that polls faster than the stated interval is slowed down

The system SHALL detect a device polling more often than the interval it was given and
SHALL answer with an instruction to slow down carrying a longer interval, rather than
with the authorization's state. This SHALL be the flow's protection against unbounded
polling, and SHALL NOT invalidate the authorization.

#### Scenario: A device polling too quickly is told to slow down

- **WHEN** a device polls again sooner than the interval it was given
- **THEN** the response instructs it to slow down and states a longer interval

#### Scenario: Being slowed down does not cancel the authorization

- **WHEN** a device that was told to slow down polls again after the longer interval
- **THEN** the authorization's actual state is reported as normal

### Requirement: The user is told out of band when a device is linked

The system SHALL notify the user through a channel independent of the browser when a
device authorization is approved, naming the client and device label and offering a way
to revoke the resulting session. The notification SHALL be sent by email, and
additionally as a direct message when the account is linked to Discord.

#### Scenario: Approving a device notifies the account owner

- **WHEN** a user approves a device authorization
- **THEN** a notification naming the client and device label, and offering revocation, is sent to that user

### Requirement: Approval is presented as an act the user must have initiated

The system SHALL supply the reviewing user with enough context to recognise a request
they did not start — at minimum the client name, the device label and the originating
IP address — because a device code flow cannot itself distinguish a user approving
their own device from a user approving an attacker's device after being persuaded to.

#### Scenario: The review response carries the request's origin

- **WHEN** an authenticated user reviews a pending authorization
- **THEN** the response includes the originating IP address alongside the client name and device label
