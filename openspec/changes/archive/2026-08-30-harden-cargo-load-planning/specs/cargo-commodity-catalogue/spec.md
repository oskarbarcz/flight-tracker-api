## ADDED Requirements

### Requirement: Dangerous goods are a small minority of what a flight is offered

The system SHALL keep the dangerous goods share of the commodities offered to a flight below one
tenth of the selection weight, at every departure airport and in every month, so that a hold
carrying hazardous freight stays the exception it is in service rather than the normal outcome of
a draw. A commodity's dangerous goods classification SHALL NOT earn it a source tier it would not
hold otherwise.

#### Scenario: The offered pool is mostly ordinary freight

- **GIVEN** any departure airport and any month
- **WHEN** commodities are offered for a flight departing there
- **THEN** the dangerous goods share of the offered selection weight is below one tenth

#### Scenario: A hazardous commodity is not promoted by being hazardous

- **WHEN** the catalogue is read
- **THEN** no dangerous goods entry names a source airport that an equivalent ordinary commodity would not name

### Requirement: A flight carrying passengers carries few dangerous goods consignments

The system SHALL place at most two dangerous goods consignments on the cargo manifest of a flight
carrying passengers, whatever the draw offers, so that a passenger belly cannot become a hazardous
cargo charter by chance. A draw that would exceed the limit SHALL be replaced by an ordinary
commodity admissible in the same compartment. A flight carrying no passengers SHALL NOT be limited,
because a freighter is a hazardous cargo carrier by design and its rate is held by how rarely the
catalogue offers such freight.

#### Scenario: A passenger flight never reports more than two hazardous consignments

- **WHEN** a cargo manifest is generated for a flight carrying passengers
- **THEN** at most two of its shipments carry dangerous goods

#### Scenario: A freighter is not limited

- **WHEN** a cargo manifest is generated for a flight carrying no passengers
- **THEN** the number of hazardous consignments is limited only by what the catalogue offers

#### Scenario: A refused hazardous draw still fills the unit

- **GIVEN** a flight carrying passengers that already carries two dangerous goods consignments
- **WHEN** a further unit is loaded
- **THEN** it carries an ordinary commodity admissible in its compartment
- **AND** the manifest's weights still reconcile to the loadsheet's cargo tonnage

#### Scenario: Most flights carry no dangerous goods at all

- **WHEN** cargo manifests are generated across the seeded fleet
- **THEN** the majority report no dangerous goods
