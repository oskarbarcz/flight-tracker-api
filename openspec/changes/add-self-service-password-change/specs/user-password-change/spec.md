## Purpose

Lets a signed-in user rotate their own password by proving knowledge of the
current one, without an administrator ever handling the new secret.

## ADDED Requirements

### Requirement: A user changes their own password

The system SHALL allow an authenticated user to replace their own password by
submitting their current password together with a new one. The system SHALL apply
the change to the requesting user only, identified from the access token, and SHALL
verify the current password against the stored credential before applying the
change. On success the system SHALL respond with no content and SHALL store the new
password only in hashed form.

#### Scenario: A user rotates their password

- **WHEN** an authenticated user submits their correct current password and a valid new password
- **THEN** the change succeeds with no content returned

#### Scenario: The new password works for signing in

- **WHEN** a user has successfully changed their password
- **THEN** signing in with the new password succeeds and signing in with the old password is rejected

#### Scenario: An unauthenticated request is rejected

- **WHEN** a password-change request carries no access token
- **THEN** the request is rejected as unauthorized and the stored password is unchanged

### Requirement: The current password must be proven

The system SHALL reject a password change whose supplied current password does not
match the stored credential, as unauthorized, and SHALL leave the stored password
unchanged. The rejection SHALL NOT reveal whether the account exists, whether it
has a password, or which submitted value was at fault beyond a single generic
message.

#### Scenario: A wrong current password is rejected

- **WHEN** an authenticated user submits an incorrect current password
- **THEN** the request is rejected as unauthorized and the stored password is unchanged

#### Scenario: The old password still works after a rejected change

- **WHEN** a password change has been rejected for a wrong current password
- **THEN** the user can still sign in with their existing password

### Requirement: Accounts without a password cannot change one

The system SHALL reject a password change for an account that has no stored
password — an account that signs in exclusively through Google — with a conflict
error explaining that the account has no password to change. The system SHALL base
this rejection on the absence of a stored password, NOT on the presence of a linked
Google account: a user who has a password and has additionally linked a Google
account SHALL be able to change that password normally.

#### Scenario: A Google-only account is rejected

- **WHEN** an authenticated user whose account has no stored password attempts to change their password
- **THEN** the request is rejected with a conflict error

#### Scenario: A password user who linked Google can still change their password

- **WHEN** an authenticated user who has both a password and a linked Google account submits their correct current password and a valid new password
- **THEN** the change succeeds

### Requirement: The new password is validated

The system SHALL reject a new password shorter than 8 characters with a validation
error, and SHALL reject a new password identical to the current one with a
validation error. In both cases the stored password SHALL be unchanged.

#### Scenario: A too-short new password is rejected

- **WHEN** an authenticated user submits a new password shorter than 8 characters
- **THEN** the request is rejected with a validation error and the stored password is unchanged

#### Scenario: Reusing the current password is rejected

- **WHEN** an authenticated user submits a new password identical to their current password
- **THEN** the request is rejected and the stored password is unchanged

### Requirement: Other sessions are revoked on a password change

The system SHALL revoke every other session belonging to the user when the password
changes, so that refresh tokens issued to other devices stop working. The system
SHALL keep the session that performed the change valid.

#### Scenario: Another device's session is revoked

- **WHEN** a user with two open sessions changes their password from the first session
- **THEN** the second session can no longer be refreshed

#### Scenario: The acting session survives

- **WHEN** a user changes their password
- **THEN** the session used to make the change can still be refreshed
