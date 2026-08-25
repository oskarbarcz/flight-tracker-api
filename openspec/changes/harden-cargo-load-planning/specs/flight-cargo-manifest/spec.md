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

#### Scenario: A load that cannot be placed refuses the release

- **GIVEN** a flight whose cargo and baggage together cannot be placed in its aircraft's hold
- **WHEN** operations releases the flight to the pilot
- **THEN** the request is rejected as unprocessable
- **AND** the flight is not released
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

The system SHALL reject as unprocessable an attempt to release a flight whose preliminary
loadsheet reports a load the aircraft's resolved hold variant cannot carry by weight or by
volume, counting the cargo tonnage together with the baggage that loadsheet implies, so that a
tonnage leaving the bags nowhere to go is refused before a manifest exists. The check SHALL
apply only where the airframe type has curated hold data.

#### Scenario: An over-capacity tonnage blocks release

- **GIVEN** a flight whose loadsheet reports more cargo than its aircraft's hold can carry
- **WHEN** operations releases the flight to the pilot
- **THEN** the request is rejected as unprocessable
- **AND** the flight is not released

#### Scenario: Cargo that leaves no room for the baggage blocks release

- **GIVEN** a flight whose cargo alone fits its aircraft's hold but whose cargo and baggage together do not
- **WHEN** operations releases the flight to the pilot
- **THEN** the request is rejected as unprocessable
- **AND** the flight is not released

#### Scenario: A flight whose type has no hold data skips the check

- **GIVEN** a flight whose aircraft's type has no curated hold data
- **WHEN** operations releases the flight with any cargo tonnage
- **THEN** the release succeeds
