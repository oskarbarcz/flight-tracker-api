## ADDED Requirements

### Requirement: Operations assigns a cabin layout to an aircraft by hand

The system SHALL let operations assign one catalogued cabin layout to an aircraft, and SHALL
let operations remove that assignment, each through its own request rather than as part of
creating or editing the aircraft. An aircraft SHALL have at most one assigned layout, and
SHALL have none until one is assigned. Assignment SHALL NOT be derived automatically from the
aircraft's operator or type.

#### Scenario: Operations assigns a layout

- **WHEN** operations assigns a catalogued layout to an aircraft
- **THEN** the aircraft reports that layout as its cabin layout

#### Scenario: Assigning replaces a previous assignment

- **GIVEN** an aircraft with an assigned layout
- **WHEN** operations assigns a different layout
- **THEN** the aircraft reports only the newly assigned layout

#### Scenario: Operations removes an assignment

- **GIVEN** an aircraft with an assigned layout
- **WHEN** operations removes the assignment
- **THEN** the aircraft reports no cabin layout

#### Scenario: An unknown layout cannot be assigned

- **WHEN** operations assigns a layout identifier that is not catalogued
- **THEN** the request is rejected as not found

#### Scenario: Only operations may assign

- **WHEN** a user who is not operations assigns a layout to an aircraft
- **THEN** the request is rejected as forbidden

#### Scenario: Assignment requires authentication

- **WHEN** an unauthenticated request assigns a layout to an aircraft
- **THEN** the request is rejected as unauthorised

### Requirement: Any airline's layout may be assigned to any aircraft

The system SHALL permit assigning a layout whose airline differs from the aircraft's
operator, and a layout whose aircraft type differs from the aircraft's type, because AeroLOPA
covers neither every airline nor every type and an approximate cabin is more useful than
none. Such an assignment SHALL be reported as a mismatch on aircraft reads so that a client
can show it, but SHALL NOT be refused.

#### Scenario: A foreign airline's layout is accepted

- **WHEN** operations assigns a layout belonging to a different airline than the aircraft's operator
- **THEN** the assignment succeeds
- **AND** the aircraft reports the assignment as mismatched

#### Scenario: A matching layout is not flagged

- **WHEN** operations assigns a layout whose airline and aircraft type match the aircraft
- **THEN** the aircraft does not report a mismatch

### Requirement: Assignment is offered ranked suggestions

The system SHALL offer operations a ranked list of candidate layouts for an aircraft, ranking
layouts matching both the aircraft's operator and its aircraft type highest, then layouts
matching the operator alone, then layouts matching the type alone. The list SHALL be a
suggestion only: it SHALL NOT restrict what may be assigned, and SHALL be returned even when
nothing matches.

#### Scenario: An exact match ranks first

- **GIVEN** a catalogued layout for the aircraft's operator and aircraft type
- **WHEN** operations requests suggestions for that aircraft
- **THEN** that layout is ranked above layouts matching only the operator or only the type

#### Scenario: Suggestions are returned when nothing matches

- **GIVEN** an aircraft whose operator and type match no catalogued layout
- **WHEN** operations requests suggestions
- **THEN** the response succeeds and reports no matching candidates

#### Scenario: Retired layouts are marked in suggestions

- **GIVEN** a retired layout that would otherwise be suggested
- **WHEN** operations requests suggestions
- **THEN** the layout is returned marked as retired

### Requirement: Aircraft types carry an IATA designator for matching

The system SHALL record, for each curated airframe, the IATA aircraft type code alongside its
ICAO type designator, because aircraft are identified by ICAO designator while cabin layouts
are keyed by IATA code, and suggestions cannot match the two without it. Airframes IATA
publishes no code for — light aircraft, business jets, military types — SHALL report none
rather than an invented code, and SHALL simply match no layout.

#### Scenario: An airframe reports both designators

- **WHEN** an authenticated user reads a curated airframe
- **THEN** the airframe reports its ICAO type designator and its IATA aircraft type code

#### Scenario: Suggestions match through the IATA code

- **GIVEN** an aircraft whose ICAO designator maps to an IATA code covered by the catalogue
- **WHEN** operations requests suggestions for that aircraft
- **THEN** layouts for that IATA code are suggested

#### Scenario: An airframe outside IATA's coding reports no IATA code

- **WHEN** an authenticated user reads a curated airframe IATA publishes no type code for
- **THEN** the airframe reports its ICAO designator and no IATA aircraft type code
