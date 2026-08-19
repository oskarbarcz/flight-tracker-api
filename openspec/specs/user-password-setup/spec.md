# user-password-setup Specification

## Purpose

Lets a user whose account has no password establish one, so that an account created
through Google Sign-In can gain local credentials without an administrator handling
the secret.

## Requirements

### Requirement: A user sets a first password on an account that has none

The system SHALL allow an authenticated user whose account has no stored password to
set one, authorised by their access token alone, and SHALL respond with no content on
success. The system SHALL apply the change to the requesting user only, identified
from the access token, and SHALL store the password only in hashed form.

#### Scenario: A Google-only user sets a password

- **WHEN** an authenticated user whose account has no stored password submits a valid new password
- **THEN** the password is set and no content is returned

#### Scenario: The new password works for signing in

- **WHEN** a user has set a first password on their account
- **THEN** signing in with their email address and that password succeeds

#### Scenario: An unauthenticated request is rejected

- **WHEN** a set-password request carries no access token
- **THEN** the request is rejected as unauthorized and no password is stored

### Requirement: A password cannot be set on an account that already has one

The system SHALL reject a set-password request for an account that already has a
stored password, with a conflict error, and SHALL leave the stored password unchanged.
Replacing a known password remains available only through the password-change
operation, which requires the current password.

#### Scenario: An account with a password is rejected

- **WHEN** an authenticated user whose account already has a password submits a new password to the set-password operation
- **THEN** the request is rejected with a conflict error and the stored password is unchanged

#### Scenario: The existing password still works after a rejected setup

- **WHEN** a set-password request has been rejected because the account already has a password
- **THEN** the user can still sign in with their existing password

### Requirement: The first password is validated and revokes other sessions

The system SHALL apply the same strength rules to a first password as to a changed
password, rejecting one that is shorter than 12 characters or that lacks an uppercase
letter, a lowercase letter, a number, or a symbol, with a validation error naming the
field. On success the system SHALL revoke every other session belonging to the user and
SHALL keep the session that set the password valid.

#### Scenario: A too-short password is rejected

- **WHEN** an authenticated user without a password submits a new password shorter than 12 characters
- **THEN** the request is rejected with a validation error and no password is stored

#### Scenario: A long password with no uppercase, number or symbol is rejected

- **WHEN** an authenticated user without a password submits a long new password of lowercase letters only
- **THEN** the request is rejected with a validation error and no password is stored

#### Scenario: A missing password is rejected

- **WHEN** an authenticated user without a password submits a request carrying no new password
- **THEN** the request is rejected with a validation error and no password is stored

#### Scenario: Another device's session is revoked

- **WHEN** a user with two open sessions sets a first password from the first session
- **THEN** the second session can no longer be refreshed and the first session still can

### Requirement: Setting a password opens the credential self-service operations

Once an account has a password, the system SHALL allow that account to change its
password, request a password reset, and change its email address — operations it
SHALL have rejected while the account had no password.

#### Scenario: Password change becomes available

- **WHEN** a user who had no password sets one and then changes it using that password as the current one
- **THEN** the change succeeds

#### Scenario: Password reset becomes available

- **WHEN** a user who had no password sets one and a password reset is then requested for their address
- **THEN** a reset email is sent to that address
