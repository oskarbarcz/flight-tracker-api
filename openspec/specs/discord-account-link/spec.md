# discord-account-link Specification

## Purpose

Lets a user prove they own a Discord account and attach it to their own account, so
the system can address them on Discord with an identity nobody could simply claim,
and lets them detach it again without losing access to the account.

## Requirements

### Requirement: A user links a Discord account by proving they own it

The system SHALL link a Discord account to the requesting user only on presentation of
an authorization code that the system itself exchanges with Discord using its client
secret. The system SHALL resolve the Discord identity from the resulting access token
rather than from anything the client supplies, and SHALL store the Discord user
identifier together with the username, display name and avatar it read. The system
SHALL apply the link to the requesting user only, identified from the access token.

#### Scenario: A user links their Discord account

- **WHEN** an authenticated user submits a valid Discord authorization code
- **THEN** the Discord account is linked to that user and the resulting link state is returned

#### Scenario: The linked profile is returned without a further read

- **WHEN** an authenticated user links a Discord account
- **THEN** the response reports the Discord user identifier, username, display name and avatar URL

#### Scenario: An authorization code Discord rejects is refused

- **WHEN** an authenticated user submits an authorization code that Discord rejects, including one already used
- **THEN** the request is rejected with a validation error and no account is linked

#### Scenario: An unauthenticated link request is rejected

- **WHEN** a link request carries no access token
- **THEN** the request is rejected as unauthorized and no account is linked

### Requirement: A callback URI is accepted only from a configured allowlist

The system SHALL reject a link or sign-in request whose redirect URI is not in the
configured allowlist, before exchanging the authorization code with Discord, so an
authorization code cannot be relayed to an attacker-controlled destination. The
rejection SHALL be a validation error.

#### Scenario: An unlisted redirect URI is rejected

- **WHEN** a request supplies a redirect URI that is not in the configured allowlist
- **THEN** the request is rejected with a validation error and no code exchange is attempted

#### Scenario: A listed redirect URI is accepted

- **WHEN** a request supplies a redirect URI that is in the configured allowlist
- **THEN** the code exchange proceeds

### Requirement: No Discord access token is retained

The system SHALL NOT persist the Discord access token obtained during a link. Any
action needing that token SHALL be performed within the request that obtained it, and
the token SHALL be discarded with the request.

#### Scenario: A link stores no token

- **WHEN** a user links a Discord account
- **THEN** only the Discord identity attributes are stored and no access or refresh token is retained

### Requirement: A user unlinks their Discord account with their password

The system SHALL clear the Discord link of the requesting user on submission of their
current password. The system SHALL reject the request when the submitted password is
wrong, when the account has no linked Discord account, or when the account has no
password at all — since unlinking then leaves no way to sign in. Unlinking SHALL NOT
remove the user from the Discord server.

#### Scenario: A user unlinks their Discord account

- **WHEN** an authenticated user with a linked Discord account submits their correct current password
- **THEN** the Discord link is cleared and the user remains a member of the Discord server

#### Scenario: A wrong password does not unlink

- **WHEN** an authenticated user submits an incorrect current password
- **THEN** the request is rejected and the Discord account stays linked

#### Scenario: Unlinking without a linked account is rejected

- **WHEN** an authenticated user with no linked Discord account requests an unlink
- **THEN** the request is rejected and nothing changes

#### Scenario: A passwordless account cannot unlink itself out of reach

- **WHEN** an authenticated user whose account has no password requests an unlink
- **THEN** the request is rejected and the Discord account stays linked

### Requirement: Discord sign-in stops working once unlinked

The system SHALL refuse Discord sign-in for an account whose link has been cleared,
and SHALL allow the same user to link a different Discord account afterwards.

#### Scenario: An unlinked account can no longer sign in with Discord

- **WHEN** a Discord sign-in is attempted for an account that has been unlinked
- **THEN** the request is rejected as unauthorized

#### Scenario: A user relinks a different Discord account

- **WHEN** a user who unlinked their Discord account links a different one
- **THEN** the new Discord account is linked
