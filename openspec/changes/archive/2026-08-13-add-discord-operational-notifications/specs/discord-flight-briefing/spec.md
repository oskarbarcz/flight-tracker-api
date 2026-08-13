## MODIFIED Requirements

### Requirement: Pilot can read their Discord briefing setting

The system SHALL let a signed-in user read, for every kind of Discord private message the system sends, whether that kind is enabled for them. A user who has never changed a setting SHALL be reported as having that kind enabled.

#### Scenario: Reading the default setting

- **WHEN** a signed-in user who never changed a setting reads their Discord settings
- **THEN** the response reports every kind of message as enabled

#### Scenario: Unauthenticated read is rejected

- **WHEN** Discord settings are read without a valid token
- **THEN** the request is rejected as unauthorized

### Requirement: Pilot can change their Discord briefing setting

The system SHALL let a signed-in user enable or disable each kind of Discord private message independently, and SHALL answer the change with the user's resulting Discord settings. A change SHALL leave every setting the request did not name untouched, and SHALL NOT require a linked Discord account.

#### Scenario: Disabling briefings

- **WHEN** a signed-in user disables briefing messages
- **THEN** the response reports briefings as disabled and later reads report the same

#### Scenario: Re-enabling briefings

- **WHEN** a signed-in user who had disabled briefing messages enables them again
- **THEN** the response reports briefings as enabled

#### Scenario: Changing one setting leaves the others alone

- **WHEN** a signed-in user who had disabled briefing messages disables delay messages without naming the briefing setting
- **THEN** the response reports both as disabled and every other setting unchanged

#### Scenario: Invalid setting value is rejected

- **WHEN** a signed-in user submits a setting that is not a boolean
- **THEN** the request is rejected as a validation failure

#### Scenario: Unauthenticated change is rejected

- **WHEN** Discord settings are changed without a valid token
- **THEN** the request is rejected as unauthorized
