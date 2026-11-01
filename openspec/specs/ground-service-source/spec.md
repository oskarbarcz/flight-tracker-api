# ground-service-source Specification

## Purpose

Records who started boarding or offboarding on a flight, and who finished offboarding: GSX
through the client running next to the simulator, or the pilot, and whether the pilot acted
while GSX was set to do it for them. Events recorded before this existed carry no source, and
the pilot caused all of them.

## Requirements

### Requirement: Starting boarding or offboarding, and finishing offboarding, names its source

The system SHALL record a `source` in the payload of the `flight.boarding-started`, `flight.offboarding-started` and `flight.offboarding-finished` events. It SHALL be `gsx` when the request says GSX is behind it, and otherwise SHALL be derived from the requesting user's GSX settings at that moment: `override` when the integration and the matching automatic setting are both on, and `manual` when either is off. Automatic deboarding is the matching setting for both offboarding steps. Requests that do not name a source SHALL keep working as they did. Finishing boarding names no source: it needs the final loadsheet from the pilot, so GSX cannot do it.

#### Scenario: The pilot starts it with GSX not set to

- **WHEN** a user starts boarding while the integration or automatic boarding is off
- **THEN** the event's source is `manual`

#### Scenario: The pilot starts it while GSX is set to

- **WHEN** a user starts boarding while the integration and automatic boarding are both on
- **THEN** the event's source is `override`

#### Scenario: Only the matching setting counts

- **WHEN** a user starts offboarding with the integration and automatic boarding on and automatic deboarding off
- **THEN** the event's source is `manual`

#### Scenario: GSX starts it

- **WHEN** a request naming GSX as its source starts boarding or offboarding while the settings allow it
- **THEN** the event's source is `gsx`

#### Scenario: GSX finishes offboarding

- **WHEN** a request naming GSX as its source finishes offboarding while the settings allow it
- **THEN** the event's source is `gsx`

### Requirement: GSX can only do what the pilot's settings allow

The system SHALL reject a request naming GSX as its source with an unprocessable error, changing nothing, when the requesting user's integration or matching automatic setting is off. The settings are checked on the API so that a change takes effect even for a client holding an older copy of them.

#### Scenario: The setting is off

- **WHEN** a request naming GSX as its source starts boarding while automatic boarding is off
- **THEN** it is rejected and the flight's status is unchanged, so the pilot can still start boarding themselves

### Requirement: A client can only claim GSX

The system SHALL accept `gsx` as the only value of `source` in a request, and SHALL reject anything else, including `null`, with a validation error. `manual` and `override` are decided by the system.

#### Scenario: A client claims to be manual

- **WHEN** a request names `manual` as its source
- **THEN** it is rejected with a validation violation naming the field
