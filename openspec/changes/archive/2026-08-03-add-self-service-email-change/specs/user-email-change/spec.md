## Purpose

Lets an authenticated user move their account to a new email address, where the new
address takes effect only after whoever requested it has proven they can read mail
at that address.

## ADDED Requirements

### Requirement: A user requests a change of their own email address

The system SHALL allow an authenticated user to request that their account's email
address be changed to a new address, on submitting their current password. The
system SHALL record the request as pending, SHALL respond as accepted, and SHALL
apply the request to the requesting user only, identified from the access token.

#### Scenario: A user requests a new address

- **WHEN** an authenticated user submits a new email address together with their correct current password
- **THEN** the request is accepted and recorded as pending

#### Scenario: A malformed address is rejected

- **WHEN** an authenticated user submits a value that is not an email address
- **THEN** the request is rejected with a validation error and no change is pending

#### Scenario: An unauthenticated request is rejected

- **WHEN** an email-change request carries no access token
- **THEN** the request is rejected as unauthorized

### Requirement: The current password must be proven, and accounts without one cannot change email

The system SHALL reject an email-change request whose supplied current password does
not match the stored credential, as unauthorized. The system SHALL reject an
email-change request from an account that has no stored password — an account that
signs in exclusively through Google — with a conflict error.

#### Scenario: A wrong current password is rejected

- **WHEN** an authenticated user submits a new address with an incorrect current password
- **THEN** the request is rejected as unauthorized and no change is pending

#### Scenario: A Google-only account is rejected

- **WHEN** an authenticated user whose account has no stored password requests an email change
- **THEN** the request is rejected with a conflict error and no change is pending

### Requirement: Control of the new address must be proven by email

The system SHALL send a message containing a single-use confirmation link to the
**new** address, and SHALL send a notification of the requested change to the
account's **current** address. The confirmation link SHALL be the only way to
complete the change.

#### Scenario: The new address receives a confirmation link

- **WHEN** an email change is requested
- **THEN** a message containing a one-time confirmation link is sent to the new address

#### Scenario: The current address is notified

- **WHEN** an email change is requested
- **THEN** a notification of the requested change is sent to the account's current address

### Requirement: A pending address cannot be used until confirmed

Until a pending email change is confirmed, the system SHALL keep the account's email
address unchanged for every purpose: signing in, password reset, and reads of the
user's own details SHALL continue to use the old address. The system SHALL NOT accept
the pending address for signing in or for password reset.

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

### Requirement: The new address must be available and different

The system SHALL reject an email-change request for an address that is already
registered to another account, with a conflict error, and SHALL reject a request for
an address equal to the account's current address, with a validation error. The
system SHALL re-check availability when the change is confirmed, and SHALL reject the
confirmation with a conflict error if the address has been taken in the meantime.

#### Scenario: An address registered to another account is rejected

- **WHEN** an authenticated user requests a change to an address that already belongs to another account
- **THEN** the request is rejected with a conflict error and no change is pending

#### Scenario: The user's current address is rejected

- **WHEN** an authenticated user requests a change to the address their account already uses
- **THEN** the request is rejected and no change is pending

#### Scenario: An address taken between request and confirmation is rejected

- **WHEN** a pending address is registered to another account after the change was requested, and the confirmation link is then used
- **THEN** the confirmation is rejected with a conflict error and the account keeps its old address

### Requirement: Confirmation tokens are single-use, expiring, and superseding

The system SHALL treat an email-change confirmation token as valid only until it is
used once and only until it expires, 24 hours after it was issued. Requesting a new
email change SHALL invalidate any pending change and its token. The system SHALL
store only a hash of the token, so that the raw token exists solely in the email sent
to the new address.

#### Scenario: A token cannot be used twice

- **WHEN** a confirmation token that has already been used successfully is submitted again
- **THEN** the request is rejected and the account's address is unchanged

#### Scenario: An expired token is rejected

- **WHEN** a confirmation token issued more than 24 hours earlier is submitted
- **THEN** the request is rejected and the account's address is unchanged

#### Scenario: A new request supersedes the pending one

- **WHEN** a second email change is requested and the token from the first confirmation email is then submitted
- **THEN** the request is rejected and the account's address is unchanged

#### Scenario: An unknown token is rejected

- **WHEN** a value that was never issued as a confirmation token is submitted
- **THEN** the request is rejected and no account's address is changed

### Requirement: Confirmation applies the new address and revokes every session

The system SHALL, on a valid confirmation, replace the account's email address with
the pending address, consume the token, and revoke all of the account's sessions.
The system SHALL accept the confirmation without an access token, since the link may
be opened outside the session that requested the change. Subsequent reads of the user
SHALL show the new address, and signing in SHALL require it.

#### Scenario: The address is replaced

- **WHEN** a valid confirmation token is submitted
- **THEN** the account's email address becomes the pending address and no content is returned

#### Scenario: Sign-in moves to the new address

- **WHEN** an email change has been confirmed
- **THEN** signing in with the new address and the account's password succeeds, and signing in with the old address is rejected

#### Scenario: Sessions are revoked

- **WHEN** a user with an open session completes an email change
- **THEN** that session can no longer be refreshed

#### Scenario: Confirmation needs no access token

- **WHEN** a valid confirmation token is submitted with no access token
- **THEN** the change is applied
