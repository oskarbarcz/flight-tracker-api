## ADDED Requirements

### Requirement: A compartment carries one temperature regime unless its freight controls its own

The system SHALL NOT place in one compartment two shipments that declare different temperature
regimes, because a bay holds one climate and the colder consignment is the one that suffers. A
shipment carried in a container that maintains its own temperature SHALL be exempt from the rule,
both as the freight being placed and as the freight already loaded, and a shipment declaring no
regime SHALL neither be blocked nor block anything.

#### Scenario: A frozen and a cool consignment are not loaded together

- **GIVEN** a compartment already carrying a frozen consignment in a passive container
- **WHEN** a cool consignment is placed
- **THEN** it is placed in another compartment

#### Scenario: A self-refrigerated container may join any compartment

- **GIVEN** a compartment already carrying a frozen consignment
- **WHEN** a cool consignment travelling in a container that maintains its own temperature is placed
- **THEN** it may share that compartment

#### Scenario: Freight declaring no regime is neutral

- **GIVEN** a compartment carrying general freight that declares no temperature regime
- **WHEN** a cool consignment is placed
- **THEN** it may share that compartment

#### Scenario: Reconciliation observes the rule generation observed

- **GIVEN** a flight whose hold already carries a frozen consignment in a passive container
- **WHEN** boarding finishes with a higher cargo tonnage and freight is added
- **THEN** no compartment ends up carrying two different temperature regimes outside self-refrigerated containers
