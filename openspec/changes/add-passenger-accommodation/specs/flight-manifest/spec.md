## ADDED Requirements

### Requirement: A flight pins the layout revision it was seated against

The system SHALL record on a flight, at the moment it is released to the pilot, the cabin
layout of its aircraft and the revision of that layout in force at that moment. Those two
values SHALL NOT change afterwards, so that refreshing a layout can never alter the seating
of a flight already released.

#### Scenario: Release pins the current revision

- **GIVEN** a flight whose aircraft has an assigned layout with a stored version
- **WHEN** operations releases the flight to the pilot
- **THEN** the flight records that layout and that revision

#### Scenario: A later revision does not move a released flight

- **GIVEN** a released flight pinned to a layout revision
- **WHEN** operations refreshes the layout and a new revision is stored
- **THEN** the flight remains pinned to the earlier revision
- **AND** its manifest still reports seats from that earlier revision

### Requirement: Releasing a flight generates a seated passenger manifest

The system SHALL generate a passenger manifest when a flight is released to the pilot, using
the passenger count from the flight's preliminary loadsheet, which is already required before
release. Each generated passenger SHALL occupy exactly one seat of the pinned revision, and
no seat SHALL be occupied twice.

#### Scenario: Release seats the loadsheet's passengers

- **GIVEN** a flight whose preliminary loadsheet reports a passenger count and whose aircraft has an assigned layout
- **WHEN** operations releases the flight to the pilot
- **THEN** the manifest holds exactly that many passengers
- **AND** every passenger occupies a distinct seat of the pinned revision

#### Scenario: A generated passenger carries a name and a booking reference

- **WHEN** a manifest is generated
- **THEN** every passenger has a name and a booking reference
- **AND** every passenger records the cabin class of the seat they occupy

### Requirement: Passengers are distributed across cabins in proportion to size

The system SHALL distribute the passenger count across the cabins of the pinned revision in
proportion to each cabin's share of the seats, allocating any rounding remainder to the
largest cabins first so the allocation sums to the total exactly. Within a cabin, seats SHALL
be chosen at random.

#### Scenario: A partial load fills cabins proportionally

- **GIVEN** a layout with a business cabin and a larger economy cabin
- **WHEN** a manifest is generated for a passenger count below the total capacity
- **THEN** each cabin is filled to approximately the same proportion of its seats

#### Scenario: A full load fills every seat

- **WHEN** a manifest is generated for a passenger count equal to the total capacity
- **THEN** every seat of the pinned revision is occupied

### Requirement: An aircraft with no cabin layout produces no manifest

The system SHALL release and board a flight whose aircraft has no assigned cabin layout
exactly as it does today, generating no manifest, pinning no revision, and applying no seat
capacity check. Reading the manifest of such a flight SHALL report that no cabin layout is
assigned rather than an empty manifest.

#### Scenario: Release succeeds without a layout

- **GIVEN** a flight whose aircraft has no assigned cabin layout
- **WHEN** operations releases the flight to the pilot
- **THEN** the release succeeds and no manifest is generated

#### Scenario: Reading a manifest that cannot exist

- **GIVEN** a released flight whose aircraft has no assigned cabin layout
- **WHEN** its manifest is read
- **THEN** the request reports that the aircraft has no cabin layout assigned

### Requirement: A passenger count exceeding seat capacity is rejected

The system SHALL reject as unprocessable an attempt to release a flight whose preliminary
loadsheet reports more passengers than the pinned layout revision has seats. The check SHALL
apply only when the aircraft has an assigned layout.

#### Scenario: An over-capacity loadsheet blocks release

- **GIVEN** a flight whose aircraft has a layout with fewer seats than its loadsheet reports passengers
- **WHEN** operations releases the flight to the pilot
- **THEN** the request is rejected as unprocessable
- **AND** the flight is not released

#### Scenario: A loadsheet at exactly capacity is accepted

- **WHEN** a flight's loadsheet reports exactly as many passengers as the layout has seats
- **THEN** the release succeeds

### Requirement: The manifest is read through its own endpoint

The system SHALL expose a flight's manifest through a dedicated endpoint rather than within
the flight body, and SHALL permit reading it to operations and to the flight's captain. Each
manifest entry SHALL report the seat designator, the deck the seat belongs to, the cabin
class, the passenger's name, their booking reference and their status.

#### Scenario: Operations reads a manifest

- **WHEN** operations reads the manifest of a released flight
- **THEN** every passenger is returned with their seat, deck, cabin class, name, booking reference and status

#### Scenario: The captain reads their own flight's manifest

- **GIVEN** a released flight with a captain assigned
- **WHEN** that captain reads the manifest
- **THEN** the manifest is returned

#### Scenario: Reading a manifest requires authentication

- **WHEN** an unauthenticated request reads a flight's manifest
- **THEN** the request is rejected as unauthorised
