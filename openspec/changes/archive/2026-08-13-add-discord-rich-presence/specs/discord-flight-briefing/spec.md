## MODIFIED Requirements

### Requirement: Pilot can read their Discord briefing setting

The system SHALL let a signed-in user read every Discord setting held for them. A setting MAY govern more than one message. A user who has never changed a setting that governs a message the system sends them SHALL be reported as having it enabled; a setting that publishes what the user is doing outside the app SHALL default to disabled instead.

#### Scenario: Reading the default setting

- **WHEN** a signed-in user who never changed a setting reads their Discord settings
- **THEN** the response reports every message setting as enabled and rich presence as disabled

#### Scenario: Unauthenticated read is rejected

- **WHEN** Discord settings are read without a valid token
- **THEN** the request is rejected as unauthorized
