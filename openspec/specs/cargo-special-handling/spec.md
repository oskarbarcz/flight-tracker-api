# cargo-special-handling

## Purpose

Describe a shipment's special handling in IATA's own codes, declare a dangerous goods shipment
in full, and derive its emergency response code from its hazard class following the published
drill chart. Covers the loading rules that follow from those codes: cargo restricted to cargo
aircraft is refused on a flight carrying passengers, incompatible loads are kept in separate
compartments, and a load needing a heated or ventilated compartment is placed only in one.

## Requirements

### Requirement: Special handling is expressed in IATA's own codes

The system SHALL describe a shipment's special handling using IATA special handling codes rather
than invented labels, drawn from a curated vocabulary covering at least perishables, live
animals, human remains, valuables, pharmaceuticals, heavy and outsized cargo, dry ice, mail,
express, magnetized material, cargo-aircraft-only load, and the dangerous goods classes. A
shipment MAY carry more than one code.

#### Scenario: A coded shipment reports recognised codes

- **WHEN** a shipment carrying special handling is read
- **THEN** every code it reports is one of the curated IATA special handling codes

#### Scenario: A shipment may carry several codes

- **WHEN** a shipment of perishable seafood is read
- **THEN** it may report both the perishable code and the code for its commodity kind

#### Scenario: General cargo carries no code

- **WHEN** a shipment of general cargo is read
- **THEN** it reports no special handling code

### Requirement: A dangerous goods shipment is fully described

The system SHALL record for every dangerous goods shipment its UN number, its proper shipping
name, its hazard class or division, any subsidiary risk, its packing group where one applies, its
number of packages, the net quantity per package, whether it is restricted to cargo aircraft, and
its emergency response code.

#### Scenario: A dangerous goods shipment reports its declaration

- **WHEN** a dangerous goods shipment is read
- **THEN** it reports a UN number, a proper shipping name, a hazard class, a package count, a net quantity per package and an emergency response code

#### Scenario: A packing group is reported only where one applies

- **WHEN** a dangerous goods shipment whose entry has no packing group is read
- **THEN** it reports no packing group rather than reporting an empty one

### Requirement: An emergency response code is derived from the hazard

The system SHALL compose an emergency response code from a drill number describing the inherent
risk of the shipment's hazard class and one or more letters describing its additional risks,
following the published aircraft emergency response drill chart. The drill number SHALL agree
with the shipment's hazard class, and every letter SHALL be one the chart defines.

#### Scenario: A code agrees with its hazard class

- **WHEN** the commodity catalogue is loaded
- **THEN** every dangerous goods entry's drill number is the one its hazard class maps to

#### Scenario: A code uses only defined letters

- **WHEN** the commodity catalogue is loaded
- **THEN** every emergency response code's letters are letters the drill chart defines

#### Scenario: A road transport guide number is not an emergency response code

- **WHEN** the commodity catalogue is loaded
- **THEN** no emergency response code is a bare three-digit number

### Requirement: Cargo restricted to cargo aircraft is refused on a flight carrying passengers

The system SHALL refuse to load a shipment restricted to cargo aircraft onto a flight whose
loadsheet reports any passengers, and SHALL permit it on a flight reporting none, because a
cargo aircraft is one carrying cargo and no passengers. The rule SHALL be applied when the
manifest is generated and again when it is reconciled, and SHALL depend on neither the airframe
nor the flight's service type.

#### Scenario: A passenger flight carries no cargo-aircraft-only load

- **GIVEN** a flight whose loadsheet reports passengers
- **WHEN** its cargo manifest is generated
- **THEN** no shipment restricted to cargo aircraft is loaded

#### Scenario: A freighter may carry cargo-aircraft-only load

- **GIVEN** a flight whose loadsheet reports no passengers
- **WHEN** its cargo manifest is generated
- **THEN** shipments restricted to cargo aircraft may be loaded

#### Scenario: An empty passenger aircraft may carry cargo-aircraft-only load

- **GIVEN** a flight operated by a passenger airframe whose loadsheet reports no passengers
- **WHEN** its cargo manifest is generated
- **THEN** shipments restricted to cargo aircraft may be loaded

#### Scenario: Reconciliation may not introduce cargo-aircraft-only load

- **GIVEN** a released flight carrying passengers
- **WHEN** boarding is finished with a higher cargo tonnage
- **THEN** no shipment restricted to cargo aircraft is added

### Requirement: Incompatible loads are kept apart

The system SHALL NOT place incompatible loads in the same compartment, applying at least these
separations: radioactive material away from live animals and from undeveloped film; infectious
substances away from foodstuffs; dry ice away from live animals; oxidizers away from flammable
liquids; and human remains away from foodstuffs.

#### Scenario: Radioactive material is kept from live animals

- **WHEN** a cargo manifest is generated carrying both radioactive material and live animals
- **THEN** they are placed in different compartments

#### Scenario: Dry ice is kept from live animals

- **WHEN** a cargo manifest is generated carrying both dry ice and live animals
- **THEN** they are placed in different compartments

#### Scenario: Infectious substances are kept from foodstuffs

- **WHEN** a cargo manifest is generated carrying both infectious substances and foodstuffs
- **THEN** they are placed in different compartments

#### Scenario: A load that cannot be segregated is not carried

- **GIVEN** an aircraft with a single compartment already holding live animals
- **WHEN** a cargo manifest requiring dry ice is generated
- **THEN** the dry ice shipment is not loaded

### Requirement: A load requiring a heated or ventilated compartment is placed in one

The system SHALL place a shipment whose commodity requires a heated compartment, a ventilated
compartment, or both, only in a compartment declaring those properties, and SHALL NOT load it at
all where the aircraft has no such compartment.

#### Scenario: Live animals are placed in a heated ventilated compartment

- **WHEN** a cargo manifest carrying live animals is generated
- **THEN** those animals are in a compartment declared heated and ventilated

#### Scenario: An aircraft without a suitable compartment carries no such load

- **GIVEN** an aircraft with no heated compartment
- **WHEN** its cargo manifest is generated
- **THEN** no shipment requiring a heated compartment is loaded
