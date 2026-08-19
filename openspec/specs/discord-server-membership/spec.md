# discord-server-membership Specification

## Purpose

Makes membership of the Discord server a visible, actionable fact, because a direct
message only reaches somebody who shares the server with the bot — so a linked account
that never joined receives no briefings at all.

## Requirements

### Requirement: A user joins the server during linking

The system SHALL add the user to the Discord server as part of a link request that
asks for it, using the access token obtained in that same request. The link SHALL
stand whether or not the join succeeds, and the response SHALL report the outcome of
the join separately from the outcome of the link, since a link is worth keeping on its
own.

#### Scenario: A user links and joins in one consent pass

- **WHEN** an authenticated user links a Discord account and asks to join the server
- **THEN** the account is linked, the user is added to the server, and the response reports the join as successful

#### Scenario: A failed join still leaves the account linked

- **WHEN** Discord refuses to add the user to the server during a link that asked for it
- **THEN** the account remains linked and the response reports the join as failed

#### Scenario: A link that does not ask to join reports no attempt

- **WHEN** an authenticated user links a Discord account without asking to join the server
- **THEN** the account is linked and the response reports that no join was requested

### Requirement: Joining requires the user's consent for it

The system SHALL reject a link request that asks to join the server when the
authorization the user granted does not cover joining, rather than linking silently
without the join. The rejection SHALL be a validation error.

#### Scenario: A join without the granted authorization is rejected

- **WHEN** a link request asks to join the server but the granted authorization does not permit it
- **THEN** the request is rejected with a validation error

### Requirement: A user can read whether their linked account is in the server

The system SHALL report, for the requesting user, whether their linked Discord account
is currently a member of the server, as `member`, `not_member` or `unknown`. The
system SHALL apply the probe to the requesting user only, identified from the access
token.

#### Scenario: A linked member is reported as a member

- **WHEN** an authenticated user whose linked Discord account is in the server reads their membership
- **THEN** the response reports `member`

#### Scenario: A linked non-member is reported as such

- **WHEN** an authenticated user whose linked Discord account is not in the server reads their membership
- **THEN** the response reports `not_member`

#### Scenario: An unauthenticated membership read is rejected

- **WHEN** a membership read carries no access token
- **THEN** the request is rejected as unauthorized

### Requirement: Membership is unknown whenever it cannot be established

The system SHALL report `unknown` whenever the truth could not be established — the
user has no linked Discord account, the connection to Discord is not available, or
Discord does not answer — and SHALL NOT report `not_member` in those cases, since
absence of an answer is not evidence of absence from the server.

#### Scenario: A user with no linked account has unknown membership

- **WHEN** an authenticated user with no linked Discord account reads their membership
- **THEN** the response reports `unknown`

#### Scenario: An unavailable connection yields unknown

- **WHEN** an authenticated user reads their membership while the connection to Discord is unavailable
- **THEN** the response reports `unknown` rather than `not_member`
