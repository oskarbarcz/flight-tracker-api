## MODIFIED Requirements

### Requirement: Baggage occupies the hold alongside cargo

The system SHALL load baggage into the same hold as cargo, as containerised units where the
aircraft's resolved hold variant offers positions and as loose bulk lots where it does not, and
SHALL distinguish a baggage unit from a cargo unit when the manifest is read. Baggage SHALL be
placed against the weight and the volume its compartment has left after the cargo, and baggage
that cannot be placed SHALL NOT be carried as a unit without a compartment.

#### Scenario: Baggage is containerised on a widebody

- **GIVEN** a flight whose aircraft resolves to a container-capable hold variant
- **WHEN** its cargo manifest is generated
- **THEN** baggage occupies containerised units in hold positions
- **AND** each reports the number of bags it holds

#### Scenario: Baggage loads loose on a bulk-only narrowbody

- **GIVEN** a flight whose aircraft resolves to a bulk-only hold variant
- **WHEN** its cargo manifest is generated
- **THEN** baggage is carried as loose bulk lots

#### Scenario: Baggage units are distinguishable

- **WHEN** a cargo manifest holding both baggage and cargo is read
- **THEN** each unit reports whether it holds baggage, cargo or mail

#### Scenario: Baggage respects the volume the cargo left behind

- **GIVEN** a flight whose cargo leaves part of a compartment's volume unused
- **WHEN** its baggage is loaded into that compartment
- **THEN** the compartment's total volume stays within its maximum

#### Scenario: Baggage that will not fit refuses the release

- **GIVEN** a flight whose hold has no room left for the baggage its loadsheet implies
- **WHEN** operations releases the flight to the pilot
- **THEN** the request is rejected as unprocessable
- **AND** no baggage unit is written without a compartment
