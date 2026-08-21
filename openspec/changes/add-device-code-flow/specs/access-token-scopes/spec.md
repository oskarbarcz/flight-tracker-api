## Purpose

Lets a session be issued with less authority than its owner has, so that a token held
by a companion application on a personal machine cannot act as the whole account if it
is stolen.

## ADDED Requirements

### Requirement: A session without scopes carries the user's full authority

The system SHALL treat a session that declares no scopes as unrestricted, subject only
to the role checks that already apply. Every session issued before this capability
existed, and every session opened by an ordinary sign-in, SHALL continue to reach every
endpoint it reaches today.

#### Scenario: An ordinary sign-in is unaffected

- **WHEN** a user signs in with a password, Google or Discord and calls any endpoint their role permits
- **THEN** the request succeeds exactly as before, with no scope declared or required

### Requirement: A scoped session reaches only endpoints that declare a matching scope

The system SHALL refuse a request made with a scoped session unless the endpoint
declares a scope that the session holds. An endpoint that declares no scope SHALL be
unreachable by any scoped session. This default-deny rule means authority is granted by
naming an endpoint, never withheld by forgetting to.

#### Scenario: A scoped session reaches an endpoint it holds the scope for

- **WHEN** a session scoped to the companion application calls the endpoint declaring that scope
- **THEN** the request succeeds

#### Scenario: A scoped session cannot reach an endpoint declaring a different scope

- **WHEN** a session scoped to the companion application calls an endpoint declaring some other scope
- **THEN** the request is rejected as forbidden

#### Scenario: A scoped session cannot reach an unannotated endpoint

- **WHEN** a session scoped to the companion application calls an endpoint that declares no scope at all
- **THEN** the request is rejected as forbidden

#### Scenario: Insufficient scope is forbidden, not unauthorized

- **WHEN** a scoped session is refused for lacking a scope
- **THEN** the refusal states that the action is forbidden, distinguishing it from a missing or invalid token

### Requirement: A session's scopes survive a refresh unchanged

The system SHALL issue refreshed tokens carrying exactly the scopes the session was
opened with, taken from the stored session rather than assumed. A scoped session SHALL
NOT become unscoped, and SHALL NOT gain a scope, by being refreshed.

#### Scenario: Refreshing a scoped session keeps it scoped

- **WHEN** a session scoped to the companion application is refreshed
- **THEN** the new access token and refresh token carry the same scopes

#### Scenario: A refreshed scoped session still cannot reach an unannotated endpoint

- **WHEN** a session scoped to the companion application is refreshed and then calls an endpoint declaring no scope
- **THEN** the request is rejected as forbidden

### Requirement: A scoped session can maintain and end itself

The system SHALL allow any session, however narrowly scoped, to refresh itself and to
sign itself out, since a session that cannot do either is unusable and cannot be
cleaned up by its holder.

#### Scenario: A scoped session refreshes itself

- **WHEN** a session scoped to the companion application refreshes
- **THEN** the request succeeds

#### Scenario: A scoped session signs itself out

- **WHEN** a session scoped to the companion application signs out
- **THEN** the request succeeds and the session can no longer be refreshed

### Requirement: A device session is issued with the companion application scope only

The system SHALL issue every session created through a device authorization with the
single scope naming the companion application, and SHALL NOT issue an unscoped session
through that path.

#### Scenario: A device link produces a scoped session

- **WHEN** a device authorization is approved and its session is issued
- **THEN** the session carries the companion application scope and nothing wider

#### Scenario: A device session cannot change the account

- **WHEN** a session obtained through a device authorization attempts to change the user's password
- **THEN** the request is rejected as forbidden
