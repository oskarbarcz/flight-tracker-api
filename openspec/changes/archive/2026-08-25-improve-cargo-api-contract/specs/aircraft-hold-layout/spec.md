## ADDED Requirements

### Requirement: Every airframe type in the operated fleet carries curated hold data

The system SHALL hold curated hold data for every airframe type an operated aircraft is
recorded as, so that the degraded, positionless manifest is reserved for a type the catalogue
genuinely does not know rather than being the ordinary outcome for a common type.

#### Scenario: A fleet type resolves to a hold layout

- **GIVEN** an airframe type that an aircraft in the fleet is recorded as
- **WHEN** its hold layout is read
- **THEN** a layout is returned rather than a not-found response

#### Scenario: A released flight on a fleet type carries positions

- **GIVEN** a flight whose aircraft is of a type the fleet operates
- **WHEN** the flight is released and its cargo manifest is read
- **THEN** the manifest reports a hold variant and its containerised units carry positions

#### Scenario: A type outside the fleet still degrades gracefully

- **GIVEN** an airframe type the catalogue does not cover
- **WHEN** a flight on that type is released
- **THEN** the manifest is generated with no positions and no compartments, as before
