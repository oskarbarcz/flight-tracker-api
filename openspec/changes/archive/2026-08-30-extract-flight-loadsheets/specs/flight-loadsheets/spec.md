## Purpose

A flight's loadsheets: the ordered history of preliminary loadsheets operations issue while
planning the load, and the single final loadsheet the crew settle on when boarding ends. This
capability covers what a flight carries, who may write each kind, how a loadsheet is read back,
and the rule that a flight cannot be released without one.

## ADDED Requirements

### Requirement: A flight carries an ordered history of preliminary loadsheets

The system SHALL record every preliminary loadsheet a flight receives as a separate revision
rather than replacing the previous one. Each revision SHALL carry a revision number that is one
higher than the flight's previous preliminary revision, starting at 1, together with the
identity of the user who issued it and the time it was issued. The flight's **current**
preliminary loadsheet SHALL be its highest revision. Earlier revisions SHALL remain readable
for the life of the flight.

A flight MAY have no preliminary loadsheet at all.

#### Scenario: The first preliminary loadsheet is revision 1

- **GIVEN** a `created` flight with no preliminary loadsheet
- **WHEN** operations updates its preliminary loadsheet
- **THEN** the flight has one preliminary loadsheet, of revision 1
- **AND** it records the issuing user and the time it was issued

#### Scenario: A further update appends a revision

- **GIVEN** a `created` flight whose current preliminary loadsheet is revision 1
- **WHEN** operations updates its preliminary loadsheet again
- **THEN** the flight has two preliminary loadsheets, of revisions 1 and 2
- **AND** revision 1 still reports the figures it was issued with

#### Scenario: The current preliminary loadsheet is the highest revision

- **GIVEN** a flight with three preliminary revisions
- **WHEN** the flight's current preliminary loadsheet is used to plan the flight
- **THEN** the figures used are those of revision 3

### Requirement: A new preliminary revision inherits the planned passenger mass

When a flight already has a preliminary loadsheet, the system SHALL carry the planned passenger
mass recorded on the current revision forward onto the new one, because the mass a flight was
planned at belongs to the plan and is never supplied by the request that revises it. Where the
flight has no preliminary loadsheet yet, and where the current revision records no planned mass,
the new revision SHALL record none and the standard adult mass applies.

#### Scenario: The imported mass survives a manual revision

- **GIVEN** a flight imported from a plan whose preliminary loadsheet records a planned passenger mass of 80 kg
- **WHEN** operations issues a new preliminary revision
- **THEN** the new revision records a planned passenger mass of 80 kg

#### Scenario: A flight planned at no stated mass keeps none

- **GIVEN** a flight whose current preliminary loadsheet records no planned passenger mass
- **WHEN** operations issues a new preliminary revision
- **THEN** the new revision records no planned passenger mass

### Requirement: A flight has at most one final loadsheet

The system SHALL allow a flight exactly one final loadsheet, written once when boarding
finishes, recording the user who issued it and the time it was issued. A final loadsheet SHALL
NOT be revised: once written it is the flight's final loadsheet for the rest of its life.

Because a preliminary loadsheet may only be written while the flight is `created` and the final
one only while it is `boarding_started`, every preliminary revision necessarily precedes the
final loadsheet.

#### Scenario: Finishing boarding writes the final loadsheet

- **GIVEN** a `boarding_started` flight with no final loadsheet
- **WHEN** cabin crew finishes boarding
- **THEN** the flight has one final loadsheet
- **AND** it records the issuing user and the time it was issued

#### Scenario: Boarding cannot be finished twice

- **GIVEN** a flight that already has a final loadsheet
- **WHEN** finishing boarding is attempted again
- **THEN** the request is rejected as unprocessable because the flight is no longer `boarding_started`
- **AND** the flight's final loadsheet is unchanged

### Requirement: A flight cannot be marked ready without a preliminary loadsheet

The system SHALL refuse as unprocessable a request to mark a flight ready while it has no
preliminary loadsheet, because a flight is released to a crew against the load it is planned to
carry. Any preliminary revision satisfies the rule; the flight is released against its current
one.

#### Scenario: A flight with no loadsheet cannot be released

- **GIVEN** a `created` flight with no preliminary loadsheet
- **WHEN** operations marks it as ready
- **THEN** the request is rejected as unprocessable
- **AND** the flight remains in `created`

#### Scenario: A flight with a preliminary loadsheet is released

- **GIVEN** a `created` flight with at least one preliminary loadsheet
- **WHEN** operations marks it as ready
- **THEN** the flight transitions to `ready`

### Requirement: A flight's loadsheets are read from the flight's loadsheet endpoint

The system SHALL serve a flight's loadsheets at `GET /api/v1/flight/{flightId}/loadsheet` as an
array in issue order, oldest first, so that the preliminary revisions read as the history they
are and the final loadsheet, when present, is last. Each entry SHALL report its kind, its
revision, the user who issued it, the time it was issued, and every figure the loadsheet
carries, including the fuel breakdown and the per-cabin passenger breakdown where those were
supplied.

The read SHALL accept an optional `type` filter of `preliminary` or `final`, returning only
loadsheets of that kind; `type=final` therefore returns an array of at most one entry. A `type`
that is neither value MUST be rejected as malformed.

The read SHALL be available to the same audience as the flight read, and SHALL report a flight
that does not exist, or a flight whose tracking is disabled to an anonymous caller, as not found.

#### Scenario: The full history is read

- **GIVEN** a flight with two preliminary revisions and a final loadsheet
- **WHEN** its loadsheets are read without a filter
- **THEN** three entries are returned, ordered preliminary revision 1, preliminary revision 2, then the final loadsheet

#### Scenario: The preliminary history is read on its own

- **GIVEN** a flight with two preliminary revisions and a final loadsheet
- **WHEN** its loadsheets are read with `type=preliminary`
- **THEN** two entries are returned, both preliminary, ordered by revision

#### Scenario: The final loadsheet is read as an array

- **GIVEN** a flight with a final loadsheet
- **WHEN** its loadsheets are read with `type=final`
- **THEN** one entry is returned, of kind final

#### Scenario: A flight with no loadsheets reports an empty array

- **GIVEN** a flight with no loadsheets
- **WHEN** its loadsheets are read
- **THEN** an empty array is returned and the request succeeds

#### Scenario: An unknown filter is refused

- **WHEN** the loadsheets are read with a `type` that is neither `preliminary` nor `final`
- **THEN** the request is rejected as malformed

#### Scenario: A flight that does not exist has no loadsheets to read

- **WHEN** the loadsheets of an unknown flight are read
- **THEN** the request is rejected as not found

### Requirement: Loadsheets are not part of the flight read

The flight read SHALL NOT carry loadsheets. Neither `GET /api/v1/flight/{flightId}` nor
`GET /api/v1/flight` reports a flight's loadsheets, in any shape, so that a client asking for a
list of flights is not sent a full loadsheet for each of them.

#### Scenario: The flight read carries no loadsheets

- **GIVEN** a flight with a preliminary and a final loadsheet
- **WHEN** the flight is read
- **THEN** the response carries no loadsheet figures

#### Scenario: The flight list carries no loadsheets

- **WHEN** flights are listed
- **THEN** no flight in the response carries loadsheet figures

### Requirement: A flight may be created with its first loadsheet

The system SHALL accept an optional loadsheet when a flight is created, and SHALL record it as
the flight's preliminary loadsheet of revision 1, issued by the user creating the flight.
Where no loadsheet is supplied the flight SHALL be created with none, and cannot be marked ready
until one is issued. A flight imported from a flight plan SHALL be created with the loadsheet
the plan states.

#### Scenario: A flight is created with a loadsheet

- **WHEN** a flight is created with a loadsheet
- **THEN** the flight has one preliminary loadsheet, of revision 1

#### Scenario: A flight is created without a loadsheet

- **WHEN** a flight is created with no loadsheet
- **THEN** the flight has no loadsheets
- **AND** its loadsheet read returns an empty array

#### Scenario: An imported flight carries the plan's loadsheet

- **WHEN** a flight is imported from a flight plan
- **THEN** it has one preliminary loadsheet, of revision 1, reporting the figures the plan states

### Requirement: A loadsheet is never overwritten

The system SHALL NOT alter or discard a loadsheet once it is written. Issuing a preliminary
revision SHALL leave every earlier revision and any final loadsheet exactly as they were, and
writing the final loadsheet SHALL leave every preliminary revision exactly as it was.

#### Scenario: An earlier revision survives a later one

- **GIVEN** a flight whose preliminary revision 1 reports 200 passengers
- **WHEN** a revision 2 reporting 210 passengers is issued
- **THEN** revision 1 still reports 200 passengers

#### Scenario: The preliminary history survives the final loadsheet

- **GIVEN** a flight with two preliminary revisions
- **WHEN** its final loadsheet is written
- **THEN** both preliminary revisions are still readable with the figures they were issued with

### Requirement: A flight with no loadsheet reports that plainly

Where an operation needs a flight's loadsheet and the flight has none, the system SHALL refuse
the request as unprocessable, naming the missing loadsheet, rather than failing in a way that
reports nothing useful. Declaring an emergency counts souls on board from the flight's final
loadsheet, or from its current preliminary loadsheet where there is no final one; a flight with
neither SHALL have its emergency declaration refused on that ground.

#### Scenario: An emergency on a flight with no loadsheet is refused

- **GIVEN** an airborne flight that has no loadsheets
- **WHEN** an emergency is declared on it
- **THEN** the request is rejected as unprocessable, naming the missing loadsheet
- **AND** no emergency is recorded

#### Scenario: Souls on board come from the final loadsheet when there is one

- **GIVEN** an airborne flight whose final loadsheet reports 288 passengers and 8 crew
- **WHEN** an emergency is declared on it
- **THEN** the emergency reports 296 souls on board
