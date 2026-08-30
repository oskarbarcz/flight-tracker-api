# flight-cargo-manifest

## Purpose

Generate a cargo manifest from a flight's preliminary loadsheet, from the cargo tonnage and
passenger count that loadsheet carries, and regenerate it whenever the loadsheet is written
again. Covers the manifest's weight
invariant against that loadsheet, the shipments and their air waybill numbers, the unit load
devices and loose bulk lots carrying them, the hold positions and compartments they are placed
in, the aircraft whose type has no curated hold data, and the endpoint the manifest is read
through.
## Requirements
### Requirement: Releasing a flight generates a cargo manifest

The system SHALL generate a cargo manifest when a flight's preliminary loadsheet is written, and
SHALL regenerate it on every later write, using the cargo tonnage and passenger count that
loadsheet carries, so that the manifest can never describe a loadsheet the flight no longer has.
The manifest SHALL consist of load units — containers and loose bulk lots — and the shipments
loaded in them. Creating a flight with a preliminary loadsheet — filled by hand or imported from a
SimBrief plan — SHALL build its load at creation, because creating it writes that loadsheet.
Releasing the flight to the pilot SHALL NOT generate anything: it is a state transition over a
manifest that already exists.

#### Scenario: Writing the loadsheet builds the load

- **GIVEN** a flight whose preliminary loadsheet reports a cargo tonnage
- **WHEN** operations writes that loadsheet
- **THEN** a cargo manifest is generated holding shipments and the units carrying them

#### Scenario: Creating a flight with a loadsheet builds its load

- **GIVEN** operations creating a flight whose body carries a preliminary loadsheet reporting a cargo tonnage
- **WHEN** the flight is created
- **THEN** its cargo manifest is generated against that tonnage

#### Scenario: Writing the loadsheet again rebuilds the load

- **GIVEN** a flight whose cargo manifest was generated from an earlier loadsheet
- **WHEN** operations writes the loadsheet again with a different cargo tonnage
- **THEN** the manifest is regenerated against the new tonnage and the old units are gone

#### Scenario: A flight carrying neither cargo nor passengers has no manifest

- **GIVEN** a flight whose preliminary loadsheet reports no cargo and no passengers
- **WHEN** operations writes that loadsheet
- **THEN** no cargo manifest is generated and the loadsheet is accepted

#### Scenario: A flight carrying passengers but no cargo still has a manifest

- **GIVEN** a flight whose preliminary loadsheet reports passengers and no cargo
- **WHEN** operations writes that loadsheet
- **THEN** a cargo manifest is generated holding the baggage units and no cargo shipments

#### Scenario: A flight with no loadsheet reports no manifest

- **GIVEN** a flight whose preliminary loadsheet has never been written
- **WHEN** its cargo manifest is read
- **THEN** the request reports that no cargo manifest has been generated yet

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
position that does not accept its base size and contour. Neither the weight nor the volume in a
compartment SHALL exceed that compartment's maximum.

#### Scenario: Each unit occupies a distinct position

- **WHEN** a cargo manifest is generated for an aircraft with a container-capable variant
- **THEN** every containerised unit occupies a distinct position of that variant

#### Scenario: A unit is not placed where it does not fit

- **WHEN** a cargo manifest is generated
- **THEN** no unit occupies a position that does not accept its base size and contour

#### Scenario: Compartment weight limits are respected

- **WHEN** a cargo manifest is generated
- **THEN** the total weight in each compartment is within that compartment's maximum

#### Scenario: Compartment volume limits are respected

- **WHEN** a cargo manifest is generated
- **THEN** the total volume in each compartment is within that compartment's maximum

#### Scenario: A loose lot is limited by the volume left in its compartment

- **GIVEN** a compartment already carrying a low-density load
- **WHEN** a further loose lot is placed
- **THEN** that lot is sized to the volume the compartment has left, and the remainder is placed elsewhere

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
- **WHEN** operations writes its preliminary loadsheet
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

### Requirement: The manifest reports the segregation conflicts present in each compartment

The system SHALL report on a flight's cargo manifest, per compartment, each pair of special
handling codes carried there that must be kept apart, so that a conflict is visible rather than
discoverable only by reimplementing the segregation rules. A compartment carrying no such pair
SHALL report none.

#### Scenario: A compartment carrying an incompatible pair reports it

- **GIVEN** a flight whose hold carries live animals and dry ice in one compartment
- **WHEN** its cargo manifest is read
- **THEN** that compartment reports the two codes as an incompatible pair

#### Scenario: A well-formed load reports no conflict

- **GIVEN** a flight whose manifest was generated by the system
- **WHEN** its cargo manifest is read
- **THEN** no compartment reports a conflict, because generation refuses to create one

#### Scenario: Offloaded freight is not reported as a conflict

- **GIVEN** a compartment whose only incompatible shipment has been offloaded
- **WHEN** the cargo manifest is read
- **THEN** that compartment reports no conflict

#### Scenario: A flight whose type has no hold data reports no conflict

- **GIVEN** a released flight whose airframe type carries no curated hold data
- **WHEN** its cargo manifest is read
- **THEN** no conflict is reported, because nothing is assigned to a compartment

### Requirement: A cargo tonnage the hold cannot take is rejected

The system SHALL reject as unprocessable an attempt to write a preliminary loadsheet reporting a
load the aircraft's resolved hold variant cannot carry by weight or by volume, counting the cargo
tonnage together with the baggage that loadsheet implies, so that a tonnage leaving the bags
nowhere to go is refused where operations can still correct it. The check SHALL apply only where
the airframe type has curated hold data, and no cargo manifest SHALL be generated when it is
refused.

#### Scenario: An over-capacity tonnage blocks the loadsheet

- **GIVEN** a loadsheet reporting more cargo than the aircraft's hold can carry
- **WHEN** operations writes it
- **THEN** the request is rejected as unprocessable
- **AND** no cargo manifest is generated

#### Scenario: Cargo that leaves no room for the baggage blocks the loadsheet

- **GIVEN** a loadsheet whose cargo alone fits the aircraft's hold but whose cargo and baggage together do not
- **WHEN** operations writes it
- **THEN** the request is rejected as unprocessable

#### Scenario: A flight whose type has no hold data skips the check

- **GIVEN** a flight whose aircraft's type has no curated hold data
- **WHEN** operations writes a loadsheet reporting any cargo tonnage
- **THEN** the loadsheet is accepted

### Requirement: The cargo manifest is read through its own endpoint

The system SHALL expose a flight's cargo manifest through a dedicated endpoint rather than
within the flight body, and SHALL permit reading it to operations and to the flight's captain.
The manifest SHALL be filterable by shipment status, and SHALL report per compartment the weight
it carries.

#### Scenario: Operations reads a cargo manifest

- **WHEN** operations reads the cargo manifest of a flight whose loadsheet has been written
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

#### Scenario: A flight whose loadsheet has not been written reports no manifest

- **GIVEN** a flight whose preliminary loadsheet has never been written
- **WHEN** its cargo manifest is read
- **THEN** the request reports that no cargo manifest has been generated yet

### Requirement: A curated aircraft places every unit it carries

The system SHALL place every load unit of a flight whose airframe type has curated hold data in
a compartment of the resolved hold variant, so that a unit carrying no compartment means one
thing only — that the type is uncurated. Where the load cannot be placed in full, the release
SHALL be refused rather than answered with a manifest holding an unplaced unit.

#### Scenario: Every unit of a curated aircraft is placed

- **GIVEN** a released flight whose aircraft's airframe type has curated hold data
- **WHEN** its cargo manifest is read
- **THEN** every load unit reports a deck and a compartment

#### Scenario: A load that cannot be placed refuses the loadsheet

- **GIVEN** a loadsheet whose cargo and baggage together cannot be placed in the aircraft's hold
- **WHEN** operations writes it
- **THEN** the request is rejected as unprocessable
- **AND** no cargo manifest is generated

### Requirement: The manifest's reported weights account for every unit's tare

The system SHALL report the cargo weight and the baggage weight of a manifest such that the two
together equal the weight of every unit aboard, tare included, so that no kilogram of the load
falls between the two figures. A baggage container's tare SHALL be reported in the baggage
weight.

#### Scenario: The reported weights account for the whole load

- **WHEN** a cargo manifest is read
- **THEN** its reported cargo weight and baggage weight together equal the sum of every unit's tare and gross weight

#### Scenario: A containerised baggage load reports its tare

- **GIVEN** a flight whose baggage is carried in containers
- **WHEN** its cargo manifest is read
- **THEN** the reported baggage weight includes those containers' tare weights

