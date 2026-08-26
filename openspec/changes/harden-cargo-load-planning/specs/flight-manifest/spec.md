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


### Requirement: A flight pins the layout revision it was seated against

The system SHALL record on a flight, at the moment its preliminary loadsheet is written, the cabin
layout of its aircraft and the revision of that layout in force at that moment. Writing the
loadsheet again SHALL pin the revision in force then, because the flight is being reseated. Once
the flight is released the two values SHALL NOT change, so that refreshing a layout can never
alter the seating of a flight already released.

#### Scenario: Writing the loadsheet pins the current revision

- **GIVEN** a flight whose aircraft has an assigned layout with a stored version
- **WHEN** operations writes its preliminary loadsheet
- **THEN** the flight records that layout and that revision

#### Scenario: A later revision does not move a released flight

- **GIVEN** a released flight pinned to a layout revision
- **WHEN** operations refreshes the layout and a new revision is stored
- **THEN** the flight remains pinned to the earlier revision
- **AND** its manifest still reports seats from that earlier revision

### Requirement: A passenger count exceeding seat capacity is rejected

The system SHALL reject as unprocessable an attempt to write a preliminary loadsheet reporting more
passengers than the aircraft's layout has seats. The check SHALL apply only when the aircraft has
an assigned layout, and the loadsheet SHALL NOT be stored when it is refused.

#### Scenario: An over-capacity loadsheet is refused

- **GIVEN** a flight whose aircraft has a layout with fewer seats than the loadsheet reports passengers
- **WHEN** operations writes that loadsheet
- **THEN** the request is rejected as unprocessable
- **AND** no manifest is generated

#### Scenario: A loadsheet at exactly capacity is accepted

- **WHEN** a loadsheet reports exactly as many passengers as the layout has seats
- **THEN** the loadsheet is accepted


### Requirement: An aircraft with no cabin layout produces no manifest

The system SHALL accept the preliminary loadsheet of a flight whose aircraft has no assigned cabin
layout, generating no manifest, pinning no revision, and applying no seat capacity check. Reading
the manifest of such a flight SHALL report that no cabin layout is assigned rather than an empty
manifest.

#### Scenario: The loadsheet is accepted without a layout

- **GIVEN** a flight whose aircraft has no assigned cabin layout
- **WHEN** operations writes its preliminary loadsheet
- **THEN** the loadsheet is accepted and no manifest is generated

#### Scenario: Reading a manifest that cannot exist

- **GIVEN** a flight whose aircraft has no assigned cabin layout
- **WHEN** its manifest is read
- **THEN** the request reports that the aircraft has no cabin layout assigned
