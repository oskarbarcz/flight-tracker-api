# gsx-settings Specification

## Purpose

Lets a user decide how GSX steers their flight: whether the GSX integration is on at all,
and, while it is, whether boarding and deboarding start automatically when the pilot
requests them through GSX. The system only holds these settings; the client running next
to the simulator is what acts on them.

## Requirements

### Requirement: A user controls the GSX integration with a master switch

The system SHALL hold a per-user GSX integration setting, readable and writable by the signed-in user at `/api/v1/user/me/gsx-settings`, and SHALL default it to disabled. Not every pilot flies with GSX, so the integration SHALL NOT be enabled without the pilot asking for it.

#### Scenario: The integration starts off

- **WHEN** a user who has never changed it reads their GSX settings
- **THEN** the integration is reported as disabled

#### Scenario: Turning the integration on

- **WHEN** a signed-in user enables the integration
- **THEN** the response reports it as enabled and later reads report the same

#### Scenario: Reading without signing in

- **WHEN** a request without a valid access token reads or changes GSX settings
- **THEN** it is rejected as unauthorized

### Requirement: A user decides whether boarding and deboarding start automatically

The system SHALL hold two per-user settings, one for whether boarding starts automatically when the pilot requests it through GSX and one for the same on deboarding, and SHALL default both to enabled. These settings apply only while the integration is on, so a client acting on them SHALL check the integration first.

#### Scenario: Both automatic starts begin on

- **WHEN** a user who has never changed them reads their GSX settings
- **THEN** automatic boarding and automatic deboarding are both reported as enabled

#### Scenario: Turning automatic boarding off leaves deboarding alone

- **WHEN** a signed-in user disables automatic boarding
- **THEN** automatic boarding is reported as disabled and automatic deboarding is unchanged

#### Scenario: Turning automatic deboarding off leaves boarding alone

- **WHEN** a signed-in user disables automatic deboarding
- **THEN** automatic deboarding is reported as disabled and automatic boarding is unchanged

### Requirement: The automatic settings survive the integration being turned off

The system SHALL store each GSX setting independently, so turning the integration off SHALL NOT change the automatic boarding and deboarding settings, and turning it back on SHALL restore the pilot's earlier choices.

#### Scenario: Turning the integration off and on again

- **WHEN** a user with automatic boarding disabled turns the integration off and then on again
- **THEN** automatic boarding is still reported as disabled

### Requirement: GSX settings are updated partially and validated

The system SHALL leave any GSX setting omitted from an update unchanged, SHALL apply the update to the requesting user only, and SHALL reject any value other than a boolean, including `null`, with a validation error naming the field.

#### Scenario: An empty update changes nothing

- **WHEN** a signed-in user submits an update with no settings
- **THEN** the request succeeds and every setting keeps its value

#### Scenario: A value that is not a boolean is rejected

- **WHEN** a signed-in user submits a setting with a string, a number or `null`
- **THEN** the request is rejected with a validation violation naming the field

#### Scenario: Another user's settings are untouched

- **WHEN** one user changes their GSX settings
- **THEN** every other user reads their own settings unchanged
