# flight-cargo-manifest

## Purpose

Generate a cargo manifest when a flight is released to the pilot, from the cargo tonnage and
passenger count its preliminary loadsheet already carries. Covers the manifest's weight
invariant against that loadsheet, the shipments and their air waybill numbers, the unit load
devices and loose bulk lots carrying them, the hold positions and compartments they are placed
in, the aircraft whose type has no curated hold data, and the endpoint the manifest is read
through.

## Requirements

### Requirement: Releasing a flight generates a cargo manifest

The system SHALL generate a cargo manifest when a flight is released to the pilot, using the
cargo tonnage and passenger count from the flight's preliminary loadsheet, which are already
required before release. The manifest SHALL consist of load units — containers and loose bulk
lots — and the shipments loaded in them.

#### Scenario: Release builds the load

- **GIVEN** a flight whose preliminary loadsheet reports a cargo tonnage
- **WHEN** operations releases the flight to the pilot
- **THEN** a cargo manifest is generated holding shipments and the units carrying them

#### Scenario: A flight carrying neither cargo nor passengers has no manifest

- **GIVEN** a flight whose preliminary loadsheet reports no cargo and no passengers
- **WHEN** operations releases the flight to the pilot
- **THEN** no cargo manifest is generated and the release succeeds

#### Scenario: A flight carrying passengers but no cargo still has a manifest

- **GIVEN** a flight whose preliminary loadsheet reports passengers and no cargo
- **WHEN** operations releases the flight to the pilot
- **THEN** a cargo manifest is generated holding the baggage units and no cargo shipments

### Requirement: The manifest's weights sum to the loadsheet's cargo tonnage exactly

The system SHALL generate a manifest whose shipment gross weights and unit tare weights together
equal the cargo tonnage of the loadsheet it was generated from, so that the manifest can never
contradict the loadsheet it describes.

#### Scenario: Cargo weights reconcile to the tonnage

- **WHEN** a cargo manifest is generated
- **THEN** the sum of its cargo shipment gross weights and its cargo unit tare weights equals the loadsheet's cargo tonnage

#### Scenario: Opening a container reduces the weight available for freight

- **GIVEN** two flights with the same cargo tonnage whose commodities differ in density
- **WHEN** their manifests are generated
- **THEN** the flight needing more containers carries less net freight

### Requirement: Cargo is carried in unit load devices bearing real designations

The system SHALL load containerised cargo into unit load devices identified by an IATA ULD type
code, a serial and an owner code, and SHALL record each device's tare weight and its gross
weight. A device SHALL NOT exceed its type's maximum gross weight nor its type's volume.

#### Scenario: A container reports its identity

- **WHEN** a containerised load unit is read
- **THEN** it reports an IATA ULD type code, a serial, an owner code, a tare weight and a gross weight

#### Scenario: No container exceeds its limits

- **WHEN** a cargo manifest is generated
- **THEN** no load unit exceeds its type's maximum gross weight
- **AND** no load unit's contents exceed its type's volume

#### Scenario: ULD identities are not reused across flights

- **WHEN** manifests are generated for two flights
- **THEN** their ULD serials are generated independently and are not tracked between flights

### Requirement: Load units are placed in hold positions the aircraft actually has

The system SHALL place each containerised load unit in a ULD position of the aircraft's resolved
hold variant, SHALL NOT place two units in the same position, and SHALL NOT place a unit in a
position that does not accept its base size and contour. The weight in a compartment SHALL NOT
exceed that compartment's maximum.

#### Scenario: Each unit occupies a distinct position

- **WHEN** a cargo manifest is generated for an aircraft with a container-capable variant
- **THEN** every containerised unit occupies a distinct position of that variant

#### Scenario: A unit is not placed where it does not fit

- **WHEN** a cargo manifest is generated
- **THEN** no unit occupies a position that does not accept its base size and contour

#### Scenario: Compartment weight limits are respected

- **WHEN** a cargo manifest is generated
- **THEN** the total weight in each compartment is within that compartment's maximum

### Requirement: Bulk-loaded aircraft carry loose lots rather than containers

The system SHALL load an aircraft whose resolved hold variant offers no ULD positions as loose
bulk lots assigned to a compartment and carrying no position designator, ULD type, serial or
tare. Cargo too small for a container on a container-capable aircraft SHALL also be loaded loose.

#### Scenario: A bulk-only narrowbody carries no containers

- **GIVEN** a flight whose aircraft resolves to a bulk-only hold variant
- **WHEN** its cargo manifest is generated
- **THEN** every load unit is a loose bulk lot with a compartment and no position

#### Scenario: A container-capable narrowbody carries containers

- **GIVEN** a flight whose aircraft is assigned a container-capable narrowbody variant
- **WHEN** its cargo manifest is generated
- **THEN** containerised units occupy positions of that variant
- **AND** any remainder is loaded loose in a loose-loaded compartment

#### Scenario: A remainder too small for a container is loaded loose

- **GIVEN** a flight whose cargo leaves a remainder below the smallest sensible container load
- **WHEN** its cargo manifest is generated
- **THEN** that remainder is carried as a loose bulk lot

### Requirement: An aircraft whose type has no hold data still carries cargo

The system SHALL generate a cargo manifest for an aircraft whose airframe type has no curated
hold data, holding shipments and units without positions or compartments, rather than failing or
generating nothing. Reading such a manifest SHALL report that the hold configuration is unknown
rather than reporting an empty hold.

#### Scenario: An uncurated type produces an unpositioned manifest

- **GIVEN** a flight whose aircraft's type has no curated hold data
- **WHEN** operations releases the flight to the pilot
- **THEN** a cargo manifest is generated whose units carry no position and no compartment

#### Scenario: Reading an unpositioned manifest

- **WHEN** the cargo manifest of such a flight is read
- **THEN** it reports that the aircraft's hold configuration is unknown

### Requirement: Every shipment carries an air waybill number, a shipper and a consignee

The system SHALL identify each shipment by an eleven-digit air waybill number consisting of a
three-digit carrier prefix, a seven-digit serial and a check digit equal to that serial modulo
seven. Every shipment SHALL also carry a shipper, a consignee, a piece count, a gross weight and
a description drawn from its commodity.

#### Scenario: An air waybill number is well formed

- **WHEN** a cargo manifest is generated
- **THEN** every shipment's air waybill number carries a three-digit prefix, a seven-digit serial and a check digit equal to the serial modulo seven

#### Scenario: A shipment is described

- **WHEN** a shipment is read
- **THEN** it reports a description, a piece count, a gross weight, a shipper and a consignee

#### Scenario: An outsized or heavy shipment reports its largest piece

- **GIVEN** a shipment coded as heavy or outsized
- **WHEN** it is read
- **THEN** it reports the weight and dimensions of its largest piece

### Requirement: A cargo tonnage the hold cannot take is rejected

The system SHALL reject as unprocessable an attempt to release a flight whose preliminary
loadsheet reports more cargo than the aircraft's resolved hold variant can carry by weight or by
volume. The check SHALL apply only where the airframe type has curated hold data.

#### Scenario: An over-capacity tonnage blocks release

- **GIVEN** a flight whose loadsheet reports more cargo than its aircraft's hold can carry
- **WHEN** operations releases the flight to the pilot
- **THEN** the request is rejected as unprocessable
- **AND** the flight is not released

#### Scenario: A flight whose type has no hold data skips the check

- **GIVEN** a flight whose aircraft's type has no curated hold data
- **WHEN** operations releases the flight with any cargo tonnage
- **THEN** the release succeeds

### Requirement: The cargo manifest is read through its own endpoint

The system SHALL expose a flight's cargo manifest through a dedicated endpoint rather than
within the flight body, and SHALL permit reading it to operations and to the flight's captain.
The manifest SHALL be filterable by shipment status, and SHALL report per compartment the weight
it carries.

#### Scenario: Operations reads a cargo manifest

- **WHEN** operations reads the cargo manifest of a released flight
- **THEN** every load unit is returned with its position, compartment and contents

#### Scenario: The captain reads their own flight's cargo manifest

- **GIVEN** a released flight with a captain assigned
- **WHEN** that captain reads the cargo manifest
- **THEN** the manifest is returned

#### Scenario: A pilot who does not command the flight is refused

- **GIVEN** a released flight captained by another pilot
- **WHEN** a pilot who is not its captain reads the cargo manifest
- **THEN** the request is rejected as forbidden

#### Scenario: Reading a cargo manifest requires authentication

- **WHEN** an unauthenticated request reads a flight's cargo manifest
- **THEN** the request is rejected as unauthorised

#### Scenario: An unreleased flight reports no manifest

- **GIVEN** a flight that has not been released
- **WHEN** its cargo manifest is read
- **THEN** the request reports that no cargo manifest has been generated yet
