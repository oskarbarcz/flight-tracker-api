## ADDED Requirements

### Requirement: The layout catalogue is mirrored locally from the provider index

The system SHALL maintain a local catalogue of every cabin layout the AeroLOPA provider
publishes, populated from the provider's layout index. Each catalogued layout SHALL record
its identifier, the airline IATA code, the aircraft IATA type code and the variant
discriminator, all as the provider reports them, together with the moment it was first seen.

#### Scenario: Synchronisation populates an empty catalogue

- **WHEN** operations triggers a catalogue synchronisation and the provider reports a set of layouts
- **THEN** every reported layout exists in the catalogue with its airline, aircraft type and variant
- **AND** the synchronisation reports how many layouts were created

#### Scenario: Synchronisation is idempotent

- **GIVEN** a catalogue already synchronised from the provider
- **WHEN** operations triggers synchronisation again and the provider reports the same layouts
- **THEN** no layout is duplicated
- **AND** the synchronisation reports no creations

#### Scenario: Only operations may synchronise

- **WHEN** a user who is not operations triggers a catalogue synchronisation
- **THEN** the request is rejected as forbidden

### Requirement: Deck-split layouts are merged into one layout

The system SHALL merge the two layouts AeroLOPA publishes for a double-deck aircraft into a
single catalogued layout, identified by the shared identifier with the trailing deck marker
removed, recording both source identifiers. A deck marker SHALL be recognised only when the
index contains both the main-deck and the upper-deck sibling; where only one exists, or where
a variant discriminator merely ends in the same letter, the entries SHALL be catalogued
unchanged.

#### Scenario: A complete deck pair collapses to one layout

- **WHEN** the index reports both a main-deck and an upper-deck layout for one aircraft configuration
- **THEN** the catalogue holds one layout under the identifier without the deck marker
- **AND** that layout records both source identifiers

#### Scenario: A lone deck-marked layout is not merged

- **WHEN** the index reports a layout whose identifier ends in a deck marker but whose sibling is absent
- **THEN** the layout is catalogued under its own identifier unchanged

#### Scenario: An ordinal variant is never mistaken for a deck

- **WHEN** the index reports layouts distinguished by an ordinal variant
- **THEN** each is catalogued separately and no merge occurs

### Requirement: Layouts withdrawn upstream are retired, never deleted

The system SHALL mark a catalogued layout as retired, recording when, if a synchronisation
finds it absent from the provider index. A retired layout SHALL remain readable and SHALL
remain referenced by any aircraft or flight that already points at it. A layout SHALL never
be deleted from the catalogue.

#### Scenario: A vanished layout is retired

- **GIVEN** a catalogued layout that the provider no longer reports
- **WHEN** operations triggers a synchronisation
- **THEN** the layout is marked retired with the time it was retired
- **AND** the layout remains readable

#### Scenario: A retired layout keeps its assignment

- **GIVEN** an aircraft assigned a layout that is subsequently retired
- **WHEN** the aircraft is read
- **THEN** the assigned layout is still reported, marked as retired

#### Scenario: A returning layout is un-retired

- **GIVEN** a retired layout
- **WHEN** a synchronisation finds the provider reporting it again
- **THEN** the layout is no longer marked retired

### Requirement: Synchronisation reports entries it could not interpret

The system SHALL report, as part of a synchronisation result, how many entries the provider
returned that could not be interpreted as a layout identifier, so that a layout published
under an unexpected identifier cannot be dropped silently.

#### Scenario: Uninterpretable entries are counted

- **WHEN** the provider index contains entries that are not layout identifiers
- **THEN** the synchronisation result reports how many were skipped

### Requirement: The catalogue is readable and searchable

The system SHALL let an authenticated user list the catalogue, filtered by airline IATA code,
by aircraft IATA type code, and by whether a layout is retired, and SHALL let an authenticated
user read a single layout by identifier. Reading a layout that does not exist SHALL be
rejected as not found.

#### Scenario: The catalogue is filtered by airline

- **WHEN** an authenticated user lists the catalogue filtered by an airline IATA code
- **THEN** only layouts for that airline are returned

#### Scenario: An unknown layout is not found

- **WHEN** an authenticated user reads a layout identifier that is not catalogued
- **THEN** the request is rejected as not found

#### Scenario: Reading the catalogue requires authentication

- **WHEN** an unauthenticated request lists the catalogue
- **THEN** the request is rejected as unauthorised
