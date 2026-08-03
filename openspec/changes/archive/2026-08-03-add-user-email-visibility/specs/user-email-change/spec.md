## ADDED Requirements

### Requirement: A changed address never retargets a linked external identity

Because a user can move their own address, the system SHALL resolve a sign-in through
a linked external identity by that identity alone, never by email address. Changing an
account's email address SHALL NOT change which account an external identity signs
into, and SHALL NOT grant an account any external identity it had not already linked.

#### Scenario: An email change does not move an external identity

- **WHEN** a user confirms a change to an address that is associated with another party's external identity
- **THEN** signing in with that external identity still resolves to whichever account linked it, not to the account that took the address

## MODIFIED Requirements

### Requirement: A pending address cannot be used until confirmed

Until a pending email change is confirmed, the system SHALL keep the account's email
address unchanged for every purpose: signing in, password reset, and reads of the
user's own details SHALL continue to use the old address. The system SHALL NOT accept
the pending address for signing in or for password reset. A pending address MAY be
reported to its own account as a pending, unconfirmed address, but SHALL NOT be
resolvable as the account's address by any other lookup.

#### Scenario: Sign-in still uses the old address

- **WHEN** an email change is pending and the user signs in with their old address and password
- **THEN** the sign-in succeeds

#### Scenario: The pending address cannot sign in

- **WHEN** an email change is pending and someone attempts to sign in with the pending address and the account's password
- **THEN** the sign-in is rejected

#### Scenario: The user's details still show the old address

- **WHEN** an email change is pending and the user reads their own details
- **THEN** the response shows the old address

#### Scenario: Password reset still targets the old address

- **WHEN** an email change is pending and a password reset is requested for the old address
- **THEN** a reset email is sent to the old address

#### Scenario: The pending address cannot recover the account

- **WHEN** an email change is pending and a password reset is requested for the pending address
- **THEN** no reset email is sent to it, since no account uses that address yet
