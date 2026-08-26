## ADDED Requirements

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

## MODIFIED Requirements

### Requirement: Releasing a flight generates a cargo manifest

The system SHALL generate a cargo manifest when a flight's preliminary loadsheet is written, and
SHALL regenerate it on every later write, using the cargo tonnage and passenger count that
loadsheet carries, so that the manifest can never describe a loadsheet the flight no longer has.
The manifest SHALL consist of load units — containers and loose bulk lots — and the shipments
loaded in them. Releasing the flight to the pilot SHALL NOT generate anything: it is a state
transition over a manifest that already exists.

#### Scenario: Writing the loadsheet builds the load

- **GIVEN** a flight whose preliminary loadsheet reports a cargo tonnage
- **WHEN** operations writes that loadsheet
- **THEN** a cargo manifest is generated holding shipments and the units carrying them

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

### Requirement: A cargo tonnage the hold cannot take is rejected

The system SHALL reject as unprocessable an attempt to write a preliminary loadsheet reporting a
load the aircraft's resolved hold variant cannot carry by weight or by volume, counting the cargo
tonnage together with the baggage that loadsheet implies, so that a tonnage leaving the bags
nowhere to go is refused where operations can still correct it. The check SHALL apply only where
the airframe type has curated hold data, and the loadsheet SHALL NOT be stored when it is
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
