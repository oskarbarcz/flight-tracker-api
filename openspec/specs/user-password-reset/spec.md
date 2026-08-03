# user-password-reset Specification

## Purpose

Lets a user who cannot supply their current password regain access to their
account, by proving control of the account's email address through a one-time link.

## Requirements

### Requirement: A user requests a password reset by email address

The system SHALL accept an unauthenticated password-reset request identified by an
email address. When the address belongs to an account that has a stored password,
the system SHALL issue a single-use reset token and send the account's email
address a message containing a link carrying that token.

#### Scenario: A known address receives a reset link

- **WHEN** an unauthenticated caller requests a password reset for the address of an account that has a password
- **THEN** the request is accepted and an email containing a one-time reset link is sent to that address

#### Scenario: A malformed address is rejected

- **WHEN** an unauthenticated caller requests a password reset for a value that is not an email address
- **THEN** the request is rejected with a validation error and no email is sent

#### Scenario: A bearer token present on the request changes nothing

- **WHEN** a signed-in caller requests a password reset for another account's address
- **THEN** the response and the email sent are the same as for an unauthenticated caller

### Requirement: The reset request does not reveal whether an account exists

The system SHALL return the same accepted response to a password-reset request
regardless of whether the address belongs to an account, whether that account has a
password, or whether an email was actually sent. Response bodies, status codes, and
error messages SHALL NOT differ between these cases.

#### Scenario: An unknown address is answered identically

- **WHEN** an unauthenticated caller requests a password reset for an address that belongs to no account
- **THEN** the response is identical to the response for a known address and no email is sent

#### Scenario: An account without a password is answered identically

- **WHEN** an unauthenticated caller requests a password reset for an account that signs in only through Google and has no stored password
- **THEN** the response is identical to the response for an account with a password and no reset email is sent

### Requirement: Reset tokens are single-use, short-lived, and superseding

The system SHALL treat a reset token as valid only until it is used once and only
until it expires, one hour after it was issued. Issuing a new reset token for an
account SHALL invalidate any outstanding token for that account. The system SHALL
store only a hash of the token, so that the raw token exists solely in the email
sent to the user.

#### Scenario: A token cannot be used twice

- **WHEN** a reset token that has already been used successfully is submitted again
- **THEN** the request is rejected and the password is unchanged

#### Scenario: An expired token is rejected

- **WHEN** a reset token issued more than an hour earlier is submitted
- **THEN** the request is rejected and the password is unchanged

#### Scenario: A newly issued token supersedes the previous one

- **WHEN** a second reset is requested for an account and the token from the first email is then submitted
- **THEN** the request is rejected and the password is unchanged

#### Scenario: An unknown token is rejected

- **WHEN** a value that was never issued as a reset token is submitted
- **THEN** the request is rejected and no password is changed

### Requirement: Repeated reset requests do not mail-bomb an address

While an account has a valid, unused reset token issued less than five minutes
earlier, the system SHALL NOT send a further reset email for that account, and
SHALL still return the same accepted response.

#### Scenario: An immediate repeat request sends no second email

- **WHEN** a password reset is requested twice in quick succession for the same address
- **THEN** both requests are accepted and only one reset email is sent

### Requirement: A valid token sets a new password

The system SHALL allow an unauthenticated caller holding a valid reset token to set
a new password for the token's account, SHALL apply the same new-password validation
as a self-service password change, and SHALL respond with no content on success.
The new password SHALL be stored only in hashed form.

#### Scenario: The password is replaced

- **WHEN** an unauthenticated caller submits a valid reset token together with a valid new password
- **THEN** the account's password is replaced and no content is returned

#### Scenario: The user can sign in with the new password

- **WHEN** a password reset has been confirmed
- **THEN** signing in with the new password succeeds and signing in with the previous password is rejected

#### Scenario: A new password that fails the password policy is rejected

- **WHEN** an unauthenticated caller submits a valid reset token with a new password that does not satisfy the policy applied to a self-service password change
- **THEN** the request is rejected with a validation error and the password is unchanged

#### Scenario: A rejected confirmation does not consume the token

- **WHEN** a confirmation is rejected because the new password failed validation
- **THEN** the reset token remains usable for a subsequent valid confirmation

### Requirement: A completed reset revokes every session

The system SHALL revoke all of the account's sessions when a password reset is
confirmed, so that any session opened by someone who had access to the old password
stops working.

#### Scenario: An existing session is revoked

- **WHEN** a user with an open session completes a password reset
- **THEN** that session can no longer be refreshed
