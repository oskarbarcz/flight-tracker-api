## ADDED Requirements

### Requirement: An aircraft may be assigned a hold variant

The system SHALL allow operations to assign to an aircraft one of the hold variants offered by
its airframe type, and SHALL reject a variant that the type does not offer. Assignment SHALL be
its own request rather than part of creating or editing an aircraft.

#### Scenario: Assigning a variant the type offers

- **GIVEN** an aircraft whose type offers a container-capable variant
- **WHEN** operations assigns that variant to the aircraft
- **THEN** the aircraft reports that variant

#### Scenario: Assigning a variant the type does not offer

- **WHEN** operations assigns to an aircraft a hold variant its type does not offer
- **THEN** the request is rejected as not found
- **AND** the aircraft's variant is unchanged

#### Scenario: Assignment is refused to a pilot

- **WHEN** a user without the operations role assigns a hold variant
- **THEN** the request is rejected as forbidden

### Requirement: An unassigned aircraft uses its type's default variant

The system SHALL treat an aircraft with no assigned hold variant as having its type's default
variant, which is the loosely loaded one wherever the type offers both a loosely loaded and a
containerised variant. No aircraft SHALL be without a hold configuration merely because nobody
assigned one.

#### Scenario: A newly created aircraft loads loose

- **WHEN** an aircraft is created and no hold variant is assigned
- **THEN** it is treated as having its type's default variant

#### Scenario: An aircraft of an uncurated type has no hold

- **GIVEN** an aircraft whose airframe type has no curated hold data
- **WHEN** its hold configuration is resolved
- **THEN** no compartments and no positions are reported

### Requirement: An assignment the data no longer offers falls back to the default

The system SHALL treat an aircraft whose assigned hold variant its airframe type no longer
offers as having the type's default variant, so that editing the curated hold data can never
leave an aircraft without a hold.

#### Scenario: A withdrawn variant resolves to the default

- **GIVEN** an aircraft assigned a hold variant its type no longer offers
- **WHEN** its hold configuration is resolved
- **THEN** the type's default variant is used

### Requirement: A hold variant assignment can be removed

The system SHALL allow operations to remove an aircraft's hold variant assignment, returning it
to its type's default rather than leaving it without a configuration.

#### Scenario: Removing an assignment restores the default

- **GIVEN** an aircraft with a container-capable variant assigned
- **WHEN** operations removes the assignment
- **THEN** the aircraft is treated as having its type's default variant
