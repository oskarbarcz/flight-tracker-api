## Purpose

Lets a user detach the Google identity linked to their account, with the safeguards
needed to ensure they always retain at least one working way to sign in.

## ADDED Requirements

### Requirement: A user unlinks their Google account

The system SHALL allow an authenticated user, on submitting their current password, to
remove the Google identity linked to their account, and SHALL respond with no content
on success. The system SHALL apply the change to the requesting user only, identified
from the access token.

#### Scenario: A linked account is unlinked

- **WHEN** an authenticated user with a linked Google account submits their correct current password to the unlink operation
- **THEN** the link is removed and no content is returned

#### Scenario: An unauthenticated request is rejected

- **WHEN** an unlink request carries no access token
- **THEN** the request is rejected as unauthorized and the link is unchanged

#### Scenario: A wrong current password is rejected

- **WHEN** an authenticated user submits an incorrect current password to the unlink operation
- **THEN** the request is rejected as unauthorized and the link is unchanged

### Requirement: Unlinking must not leave an account unreachable

The system SHALL reject an unlink request from an account that has no stored password,
with a conflict error, because removing the Google link would leave that account with
no way to sign in. The account SHALL be required to set a password first.

#### Scenario: An account without a password cannot unlink

- **WHEN** an authenticated user whose account has no stored password attempts to unlink their Google account
- **THEN** the request is rejected with a conflict error and the link is unchanged

#### Scenario: Setting a password then unlinking succeeds

- **WHEN** a user whose account has no password sets one and then submits it to the unlink operation
- **THEN** the link is removed and the user can sign in with their email address and password

### Requirement: Unlinking requires a link to exist

The system SHALL reject an unlink request from an account that has no linked Google
identity, with a conflict error.

#### Scenario: An unlinked account cannot be unlinked

- **WHEN** an authenticated user with no linked Google account attempts to unlink
- **THEN** the request is rejected with a conflict error

#### Scenario: Unlinking twice is rejected

- **WHEN** a user who has just unlinked their Google account submits the unlink request again
- **THEN** the second request is rejected with a conflict error

### Requirement: An unlinked Google identity can no longer sign in, and can be relinked

After an account is unlinked, the system SHALL reject Google sign-in with that Google
identity's token, since no account is linked to it. The system SHALL allow the account
to link a Google identity again afterwards, including a different one.

#### Scenario: Google sign-in stops working for the unlinked identity

- **WHEN** a Google identity's token is presented for sign-in after the account it belonged to was unlinked
- **THEN** the sign-in is rejected as unauthorized

#### Scenario: The account can link a Google identity again

- **WHEN** a user who has unlinked their Google account links a Google identity again
- **THEN** the link is established and Google sign-in works for that identity

#### Scenario: Password sign-in is unaffected

- **WHEN** a user unlinks their Google account
- **THEN** signing in with their email address and password continues to work

### Requirement: Unlinking does not revoke sessions

The system SHALL leave the user's existing sessions valid when a Google account is
unlinked, since those sessions were opened legitimately and the user's remaining
credential is unchanged.

#### Scenario: An open session survives unlinking

- **WHEN** a user with an open session unlinks their Google account
- **THEN** that session can still be refreshed
