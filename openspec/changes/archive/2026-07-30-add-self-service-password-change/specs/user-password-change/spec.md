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

### Requirement: The new password must be strong

The system SHALL reject a new password that is shorter than 12 characters, or that
lacks an uppercase letter, a lowercase letter, a number, or a symbol, with a
validation error naming the whole policy rather than the specific part that failed.
The system SHALL apply this policy only to the new password: the current password is
accepted as stored, so a user whose existing password predates the policy can still
change it.

#### Scenario: A too-short new password is rejected

- **WHEN** an authenticated user submits a new password shorter than 12 characters
- **THEN** the request is rejected with a validation error and the stored password is unchanged

#### Scenario: A long new password with no uppercase, number or symbol is rejected

- **WHEN** an authenticated user submits a long new password made only of lowercase letters
- **THEN** the request is rejected with a validation error and the stored password is unchanged

#### Scenario: A new password missing only a symbol is rejected

- **WHEN** an authenticated user submits a long new password with upper and lower case letters and a number but no symbol
- **THEN** the request is rejected with a validation error and the stored password is unchanged

#### Scenario: An existing weak password can still be used to authorise the change

- **WHEN** a user whose stored password would not satisfy the policy submits it as their current password together with a compliant new password
- **THEN** the change succeeds

### Requirement: The new password must differ from the current one

The system SHALL reject a new password identical to the current one, with a validation
error, and SHALL leave the stored password unchanged.

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

### Requirement: A revoked session is rejected as unauthorized

The system SHALL reject an attempt to refresh a session that no longer exists — because
it was revoked by a password change, signed out, or never existed — as unauthorized,
reporting that the session is no longer valid. The system SHALL NOT report such an
attempt as a server error.

#### Scenario: Refreshing a revoked session is unauthorized

- **WHEN** a refresh is attempted with a validly signed refresh token whose session has been revoked
- **THEN** the request is rejected as unauthorized, stating that the session is no longer valid

#### Scenario: Refreshing an unknown session is unauthorized

- **WHEN** a refresh is attempted with a validly signed refresh token naming a session that never existed
- **THEN** the request is rejected as unauthorized rather than as a server error
