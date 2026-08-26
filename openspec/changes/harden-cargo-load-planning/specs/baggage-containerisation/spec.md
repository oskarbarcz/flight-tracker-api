## MODIFIED Requirements

### Requirement: Baggage occupies the hold alongside cargo

The system SHALL load baggage into the same hold as cargo, as containerised units where the
aircraft's resolved hold variant offers positions and as loose bulk lots where it does not, and
SHALL distinguish a baggage unit from a cargo unit when the manifest is read. Baggage SHALL be
placed before the cargo, taking the positions, the weight and the volume it needs, so that freight
never displaces a passenger's bags; the cargo SHALL then be planned into what remains. Baggage
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

#### Scenario: Baggage keeps a container position the cargo wanted

- **GIVEN** a flight whose cargo alone would fill every container position its hold offers
- **WHEN** its manifest is generated
- **THEN** the baggage occupies the positions it needs
- **AND** the cargo takes a loose bulk lot for what no longer fits a container

#### Scenario: A compartment carrying baggage stays within its volume

- **GIVEN** a flight whose baggage and cargo share a compartment
- **WHEN** its manifest is generated
- **THEN** the compartment's total volume stays within its maximum

#### Scenario: Baggage that will not fit refuses the release

- **GIVEN** a flight whose hold has no room left for the baggage its loadsheet implies
- **WHEN** operations releases the flight to the pilot
- **THEN** the request is rejected as unprocessable
- **AND** no baggage unit is written without a compartment

### Requirement: Baggage falls back to the passenger count when the payload cannot account for it

The system SHALL derive the baggage weight from the passenger count instead of the payload residual
where that residual implies an implausible mass per passenger, and SHALL report which of the two
sources it used. A payload smaller than its passengers at the standard mass plus its cargo SHALL be
refused when the loadsheet is written rather than reaching this fallback, so the residual reaching
it is never negative. A loadsheet SHALL NOT be rejected for leaving no baggage allowance, because a
payload stated as passengers plus cargo alone is a legitimate way to fill one.

#### Scenario: A payload that accounts for baggage is reconciled

- **GIVEN** a loadsheet whose payload exceeds its passengers at the standard mass plus its cargo by a plausible baggage allowance
- **WHEN** its cargo manifest is generated
- **THEN** the baggage weight equals that residual
- **AND** the manifest reports the baggage as reconciled from the payload

#### Scenario: An implausible residual falls back

- **GIVEN** a loadsheet whose residual implies an implausible baggage mass per passenger
- **WHEN** its cargo manifest is generated
- **THEN** the baggage weight is derived from the passenger count
- **AND** the manifest reports the baggage as derived

#### Scenario: A loadsheet is never rejected for its baggage allowance

- **WHEN** operations writes a loadsheet whose payload leaves no baggage allowance
- **THEN** the loadsheet is accepted
