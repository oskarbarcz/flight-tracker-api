## ADDED Requirements

### Requirement: A completed enrichment push grades the airport flagship

The system SHALL grade an airport `flagship` when a data enrichment push applies at least one
change to it, whatever grade the airport held before, because reconciling an airport against the
external map data the curation workflow is built on is the act the top grade describes. The grade
SHALL be raised as part of the push, and SHALL NOT depend on which records the push touched or on
how many of them there were.

A push that writes nothing SHALL leave the grade untouched: where every selected change was
skipped because the external data already agreed with the airport, or failed because a record it
depends on was not pushed alongside it, no record changed and the airport's grade SHALL stand as
it was. Reviewing an airport against the external data without pushing anything SHALL likewise
leave the grade untouched.

The raised grade SHALL remain an ordinary grade afterwards: operations SHALL be able to change it
again, downwards included, exactly as for any other airport.

#### Scenario: A push that lands a change grades the airport flagship

- **GIVEN** an airport graded `low`
- **WHEN** an operations user pushes a selection of enrichment changes and at least one is added, updated or removed
- **THEN** the airport's data quality grade is `flagship`

#### Scenario: The previous grade does not matter

- **GIVEN** an airport graded `high`
- **WHEN** an operations user pushes a selection of enrichment changes and at least one lands
- **THEN** the airport's data quality grade is `flagship`

#### Scenario: A push that writes nothing leaves the grade alone

- **GIVEN** an airport graded `low`
- **WHEN** an operations user pushes only changes the airport has already caught up with, and every one is skipped
- **THEN** the airport's data quality grade is still `low`

#### Scenario: A push where everything fails leaves the grade alone

- **GIVEN** an airport graded `low`
- **WHEN** an operations user pushes only changes that fail for want of a record they depend on
- **THEN** the airport's data quality grade is still `low`

#### Scenario: Reviewing without pushing changes nothing

- **GIVEN** an airport graded `low`
- **WHEN** an operations user reviews the airport against the external map data and pushes nothing
- **THEN** the airport's data quality grade is still `low`

#### Scenario: The grade can be lowered again afterwards

- **GIVEN** an airport graded `flagship` by an enrichment push
- **WHEN** an operations user sets its grade to `high`
- **THEN** the change succeeds and the airport reports the grade `high`

## MODIFIED Requirements

### Requirement: The grade is an editorial judgement, not a derived value

The system SHALL treat an airport's data quality grade as a value set by a person and SHALL NOT
recompute or override it from the data held for the airport. Adding a boundary shape, terminals,
gates or runways to an airport SHALL NOT change its grade, and changing its grade SHALL NOT
require any of that data to be present.

A data enrichment push is the single exception: it is a person's reviewed decision to bring the
airport in line with the external map data in one act, and the system SHALL grade the airport
`flagship` when such a push applies a change. No other write to an airport or to the records it
holds SHALL move the grade.

#### Scenario: Curating an airport does not change its grade

- **WHEN** an operations user adds a boundary shape, a terminal or a runway to an airport
- **THEN** the airport's data quality grade is unchanged until someone changes it explicitly

#### Scenario: A grade can be raised before the data lands

- **WHEN** an operations user raises the grade of an airport that has no boundary shape
- **THEN** the change succeeds

#### Scenario: The grade is never recomputed from the data held

- **GIVEN** an airport graded `flagship` whose terminals are then removed one by one
- **WHEN** the airport is read
- **THEN** its grade is still `flagship`
