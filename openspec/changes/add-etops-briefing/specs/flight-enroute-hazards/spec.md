## ADDED Requirements

### Requirement: A flight snapshots the enroute hazards its plan carries

When a flight is created from a SimBrief operational flight plan publishing significant
meteorological information, the system SHALL store each hazard against that flight, recording
its identifier, its hazard type, the flight information region that issued it, the period it is
valid for, and its text as published. The snapshot SHALL belong to the flight and SHALL NOT be
refreshed after import.

#### Scenario: The plan's hazards are stored

- **WHEN** a flight is created from a plan publishing five significant meteorological reports
- **THEN** the flight reports those hazards, each with its type, issuing region, validity period and text

#### Scenario: A hazard published under two regions is stored once

- **WHEN** an imported plan publishes the same hazard identifier under more than one region
- **THEN** the flight reports that hazard once

#### Scenario: An unrecognised hazard type is preserved

- **WHEN** a plan publishes a hazard of a type the system does not recognise
- **THEN** the hazard is stored with its type as published and the import completes normally

#### Scenario: A plan without hazards

- **WHEN** a flight is created from a plan publishing no significant meteorological information
- **THEN** no hazards are recorded and the import completes normally

### Requirement: An ETOPS flight records the regions its ETOPS segment crosses

The system SHALL store the flight information regions the plan marks as ETOPS-relevant, so that
the briefing can state where the ETOPS segment lies.

#### Scenario: The ETOPS regions are reported

- **GIVEN** a plan marking two regions as ETOPS-relevant
- **WHEN** the flight's enroute hazards are read
- **THEN** both regions are reported as the regions the ETOPS segment crosses
