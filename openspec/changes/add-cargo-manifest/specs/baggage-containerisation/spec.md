## ADDED Requirements

### Requirement: Baggage weight is derived from the loadsheet's payload

The system SHALL derive the baggage aboard a flight from its loadsheet, as the payload less the
passengers at the standard adult mass less the cargo tonnage, so that the baggage in the hold
always reconciles with the payload the loadsheet declares.

#### Scenario: Baggage is the payload residual

- **WHEN** a cargo manifest is generated for a flight carrying passengers
- **THEN** the baggage weight in the hold equals the payload less the passengers at the standard mass less the cargo

#### Scenario: A flight with no passengers carries no baggage

- **GIVEN** a flight whose loadsheet reports no passengers
- **WHEN** its cargo manifest is generated
- **THEN** no baggage is loaded

### Requirement: A payload that cannot be reconciled is rejected

The system SHALL reject as unprocessable a loadsheet whose payload leaves no plausible baggage
residual, whether because the residual is negative or because it implies an implausible mass per
passenger. The check SHALL apply only where the airframe type has curated hold data.

#### Scenario: A payload smaller than its passengers and cargo is rejected

- **WHEN** a loadsheet is submitted whose payload is less than its passengers at the standard mass plus its cargo
- **THEN** the request is rejected as unprocessable

#### Scenario: An implausible residual is rejected

- **WHEN** a loadsheet is submitted whose residual implies an implausible baggage mass per passenger
- **THEN** the request is rejected as unprocessable

#### Scenario: A consistent payload is accepted

- **WHEN** a loadsheet is submitted whose payload leaves a plausible baggage residual
- **THEN** the loadsheet is accepted

### Requirement: Baggage is converted to bags at the standard mass for the sector

The system SHALL convert the baggage weight into a number of bags using the standard checked
baggage mass for the flight's sector length, so that a short sector and an intercontinental one
do not produce the same bag count from the same weight.

#### Scenario: Bags are counted at the standard mass

- **WHEN** baggage is loaded
- **THEN** the bag count is the baggage weight divided by the standard mass for the flight's sector length

#### Scenario: Sector length changes the bag count

- **GIVEN** two flights carrying the same baggage weight over different sector lengths
- **WHEN** their manifests are generated
- **THEN** their bag counts differ

### Requirement: Baggage occupies the hold alongside cargo

The system SHALL load baggage into the same hold as cargo, as containerised units where the
aircraft's resolved hold variant offers positions and as loose bulk lots where it does not, and
SHALL distinguish a baggage unit from a cargo unit when the manifest is read.

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

### Requirement: Premium cabin baggage is loaded separately

The system SHALL load the baggage of passengers in the premium cabins into its own units, using
the loadsheet's per-cabin passenger breakdown where one is given, so that priority baggage can be
unloaded first.

#### Scenario: Premium baggage has its own unit

- **GIVEN** a flight whose loadsheet reports passengers in a premium cabin
- **WHEN** its cargo manifest is generated
- **THEN** at least one baggage unit holds only premium cabin baggage and is marked as priority

#### Scenario: A single-class flight has no priority unit

- **GIVEN** a flight whose passengers are all in one cabin
- **WHEN** its cargo manifest is generated
- **THEN** no baggage unit is marked as priority

### Requirement: Baggage does not count toward the cargo tonnage

The system SHALL keep baggage weight separate from the loadsheet's cargo tonnage, so that the
cargo invariant is unaffected by baggage and the hold's weight limits account for both.

#### Scenario: Baggage is excluded from the cargo invariant

- **WHEN** a cargo manifest holding both baggage and cargo is generated
- **THEN** the cargo shipment and tare weights alone equal the loadsheet's cargo tonnage

#### Scenario: Compartment limits account for baggage

- **WHEN** a cargo manifest holding both baggage and cargo is generated
- **THEN** the weight in each compartment, counting baggage and cargo together, is within that compartment's maximum
