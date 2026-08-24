# aircraft-hold-layout

## Purpose

Hold curated reference data describing the cargo holds of an airframe type: its decks, its
numbered compartments, the loading method of each compartment, and the ULD positions each
container-capable compartment offers. A type's holds are expressed as named variants, exactly
one of which is the default, and the catalogue is readable by any authenticated user as the
reference data it is.

## Requirements

### Requirement: Every curated airframe type declares its hold configuration

The system SHALL hold curated reference data describing the cargo holds of an airframe type:
its decks, its numbered compartments, the loading method of each compartment, and the ULD
positions each container-capable compartment contains. The data SHALL cover at least the
airframe types in the seeded fleet and the ten freighter designators, and a type absent from
the data SHALL NOT prevent a flight from operating.

#### Scenario: Reading a curated widebody type

- **WHEN** an authenticated user reads the hold configuration of a curated widebody type
- **THEN** its lower deck compartments are reported with their ULD positions and weight limits

#### Scenario: Reading a curated freighter type

- **WHEN** an authenticated user reads the hold configuration of a freighter designator
- **THEN** both a main deck and a lower deck are reported

#### Scenario: An uncurated type reports no hold configuration

- **WHEN** an authenticated user reads the hold configuration of an airframe type absent from the data
- **THEN** the request reports that no hold configuration is known for that type

### Requirement: A type offers named hold variants and declares a default

The system SHALL express a type's hold configuration as one or more named variants, exactly one
of which SHALL be declared the default. Where a type offers both a loosely loaded variant and a
containerised one, the loosely loaded variant SHALL be the default, so that an aircraft with no
assignment is never assumed to have container capability it may not have been built with. Where
every variant of a type is containerised, any one of them MAY be the default. Variants of one
type SHALL differ in the positions available rather than in the compartments themselves, so that
the same aircraft always has the same compartments whatever its variant.

#### Scenario: A type with a single variant

- **WHEN** the hold configuration of a type offering one variant is read
- **THEN** that variant is reported as the default

#### Scenario: A type with a container-capable option

- **GIVEN** a narrowbody type offering both a bulk-only and a container-capable variant
- **WHEN** its hold configuration is read
- **THEN** both variants are reported, the bulk-only one as the default
- **AND** both declare the same compartments

#### Scenario: A type whose every variant is containerised

- **GIVEN** a widebody type offering a container variant and a pallet variant, having no bulk-only variant
- **WHEN** its hold configuration is read
- **THEN** both variants are reported and one of them is the default

### Requirement: A bulk-loaded compartment declares no positions

The system SHALL describe a compartment that is loaded loose as carrying no ULD positions, and
SHALL NOT invent position designators for it. Every variant SHALL include at least one loose-loaded
compartment, so that loose load is always possible.

#### Scenario: A bulk-only type has no positions at all

- **WHEN** the hold configuration of a bulk-only narrowbody is read
- **THEN** every compartment reports loose loading and no positions

#### Scenario: A container-capable type still has a loose compartment

- **WHEN** the hold configuration of a widebody is read
- **THEN** at least one compartment reports loose loading

### Requirement: A position declares what it can accept

The system SHALL record for each ULD position the base sizes and contours it accepts, and its
own maximum weight. A position SHALL NOT be reported as accepting a ULD whose base or contour
it does not list.

#### Scenario: A position reports its compatibility

- **WHEN** a ULD position is read
- **THEN** it reports the base sizes and contours it accepts and its maximum weight

#### Scenario: Aft positions accept a reduced contour

- **GIVEN** a widebody variant whose aft-most positions sit where the fuselage tapers
- **WHEN** its positions are read
- **THEN** those positions accept fewer contours than the positions further forward

### Requirement: A compartment declares its limits and its environment

The system SHALL record for each compartment its maximum weight, its volume, whether it is
heated and whether it is ventilated, so that loads requiring a heated or ventilated compartment
can be placed correctly.

#### Scenario: A compartment reports its environment

- **WHEN** a compartment is read
- **THEN** it reports its maximum weight, volume, and whether it is heated and ventilated

### Requirement: Position designators follow a stated convention

The system SHALL designate a ULD position by its compartment number, its ordinal within that
compartment and its side, and SHALL describe this as a convention of this system rather than as
a published designation, because no public source designates hold positions for a given type. A
designator SHALL be unique within a variant and SHALL remain stable across reads.

#### Scenario: Designators are unique within a variant

- **WHEN** the positions of a variant are read
- **THEN** no designator appears twice

#### Scenario: The convention is documented where positions are exposed

- **WHEN** the hold configuration endpoint is described
- **THEN** the description states that position designators are this system's convention

### Requirement: The hold catalogue is readable

The system SHALL expose the curated hold data through a dedicated read, permitting it to any
authenticated user, since it is reference data.

#### Scenario: An authenticated user lists curated types

- **WHEN** an authenticated user lists the curated hold configurations
- **THEN** every curated type is returned with its variants

#### Scenario: Reading the hold catalogue requires authentication

- **WHEN** an unauthenticated request reads the hold catalogue
- **THEN** the request is rejected as unauthorised
