## MODIFIED Requirements

### Requirement: Releasing a flight generates a seated passenger manifest

The system SHALL generate a passenger manifest when a flight's preliminary loadsheet is written,
and SHALL regenerate it on every later write, using the passenger count that loadsheet carries, so
that the manifest can never describe a loadsheet the flight no longer has. Each generated
passenger SHALL occupy exactly one seat of the pinned revision, and no seat SHALL be occupied
twice. Releasing the flight to the pilot SHALL NOT seat anyone: it is a state transition over a
manifest that already exists.

#### Scenario: Writing the loadsheet seats its passengers

- **GIVEN** a flight whose preliminary loadsheet reports a passenger count and whose aircraft has an assigned layout
- **WHEN** operations writes that loadsheet
- **THEN** the manifest holds exactly that many passengers
- **AND** every passenger occupies a distinct seat of the pinned revision

#### Scenario: Writing the loadsheet again reseats the cabin

- **GIVEN** a flight already seated from an earlier loadsheet
- **WHEN** operations writes the loadsheet again with a different passenger count
- **THEN** the manifest holds the new count and the earlier seating is gone

#### Scenario: A generated passenger carries a name and a booking reference

- **WHEN** a manifest is generated
- **THEN** every passenger has a name and a booking reference
- **AND** every passenger records the cabin class of the seat they occupy

### Requirement: An unreleased flight reports no manifest rather than no layout

The system SHALL distinguish a flight whose preliminary loadsheet has never been written, and
therefore has no manifest yet, from a flight whose aircraft carries no cabin layout at all, so
that a client is never told the aircraft is uncatalogued when the flight merely has no loadsheet.

#### Scenario: Reading the manifest of a flight with no loadsheet

- **GIVEN** a flight whose aircraft has an assigned cabin layout and whose preliminary loadsheet has never been written
- **WHEN** its manifest is read
- **THEN** the request reports that no manifest has been generated yet
