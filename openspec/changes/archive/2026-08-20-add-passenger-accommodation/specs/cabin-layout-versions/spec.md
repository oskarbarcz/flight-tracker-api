## ADDED Requirements

### Requirement: A layout's seat data is stored as immutable versions

The system SHALL store the seat data of a cabin layout as versions that are never modified
once written. Each version SHALL record an incrementing revision number, the revision date
the provider reports for the layout, the moment it was fetched, a content hash, the total
number of seats across all decks, and the payload as the provider returned it.

#### Scenario: The first fetch creates the first version

- **GIVEN** a catalogued layout with no stored seat data
- **WHEN** the layout's seat data is fetched
- **THEN** a version is stored with revision 1 and the provider's revision date
- **AND** its total seat count is the sum across every deck

#### Scenario: A stored version is never altered

- **GIVEN** a layout with a stored version
- **WHEN** a later fetch produces different seat data
- **THEN** the existing version is unchanged and a new version is added

### Requirement: Versions are retained permanently

The system SHALL retain every stored version of a layout for as long as the layout exists.
Versions SHALL NOT be pruned, expired or garbage-collected, because a flight records the
revision it was seated against rather than copying the seats, and removing a version would
destroy the seating of a completed flight.

#### Scenario: An unreferenced version is kept

- **GIVEN** a layout with several versions, of which one is referenced by no flight
- **WHEN** the layout is next refreshed
- **THEN** every existing version remains stored

### Requirement: Seat data is fetched when first required

The system SHALL fetch a layout's seat data from the provider the first time that data is
required and not before, so that cataloguing every published layout does not retrieve every
seat map. A fetch that the provider cannot satisfy SHALL surface as a provider failure and
SHALL NOT leave a partial version stored.

#### Scenario: Reading a layout without stored seats fetches them

- **GIVEN** a catalogued layout with no stored version
- **WHEN** an authenticated user reads that layout
- **THEN** the seat data is fetched, stored as a version, and returned

#### Scenario: A failed fetch stores nothing

- **GIVEN** a catalogued layout with no stored version
- **WHEN** the provider cannot return its seat data
- **THEN** the request fails and no version is stored

### Requirement: Refreshing writes a version only when content changed

The system SHALL let operations refresh a layout's seat data on demand, and SHALL add a new
version only when the fetched payload's content hash differs from the newest stored version.
The content hash SHALL exclude the query strings of asset URLs, because those carry
cache-busting values that change independently of the cabin.

#### Scenario: An unchanged layout gains no version

- **GIVEN** a layout whose newest stored version matches what the provider now returns
- **WHEN** operations refreshes the layout
- **THEN** no new version is added and the result reports the layout as unchanged

#### Scenario: A changed layout gains a version

- **GIVEN** a layout whose stored seat data differs from what the provider now returns
- **WHEN** operations refreshes the layout
- **THEN** a new version is added with the next revision number

#### Scenario: A rotated asset parameter is not a change

- **GIVEN** a layout whose provider payload differs only in the query string of its asset URLs
- **WHEN** operations refreshes the layout
- **THEN** no new version is added

#### Scenario: Only operations may refresh

- **WHEN** a user who is not operations refreshes a layout
- **THEN** the request is rejected as forbidden

### Requirement: Seats belong to a deck that owns their coordinate space

The system SHALL group the seats of a version by deck, where a deck records which deck it is,
the source layout identifier it came from, its own canvas dimensions, its own asset URLs and
its own cabin descriptions. Seat coordinates SHALL be interpreted only against the canvas of
the deck the seat belongs to. A single-deck layout SHALL have exactly one deck, recorded as
the main deck.

#### Scenario: A dual-deck layout stores two decks

- **GIVEN** a layout merged from a main-deck and an upper-deck source
- **WHEN** its version is read
- **THEN** two decks are returned, each with its own canvas, assets and cabins
- **AND** each seat belongs to exactly one of them

#### Scenario: A single-deck layout stores one main deck

- **WHEN** a layout with no deck split is stored
- **THEN** its version has one deck, recorded as the main deck, whose source identifier is the layout identifier

#### Scenario: Seat designators are unique across decks

- **GIVEN** a stored dual-deck version
- **WHEN** its seats are read
- **THEN** no designator appears more than once across both decks

### Requirement: A seat records its geometry, cabin and advisory data

The system SHALL store, for each seat, its designator, its position and size, its rotation,
whether it faces rearward, its cabin class, its rating where the provider gives one, its
window status where the provider gives one, and any comments with their sentiment and
severity. An absent rating SHALL be stored as absent and SHALL NOT be interpreted as an
average or neutral rating.

#### Scenario: An unrated seat stays unrated

- **WHEN** the provider reports a seat with no rating
- **THEN** the stored seat has no rating

#### Scenario: Seat comments retain sentiment and severity

- **WHEN** the provider reports a seat carrying comments
- **THEN** each stored comment retains its identifier, text, sentiment and severity
