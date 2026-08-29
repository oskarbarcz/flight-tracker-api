# airport-data-curation Specification

## Purpose

Keeps airport records consistent whatever their origin: fields arriving from the
external airport data provider are normalised into the project's own vocabulary, and
the completeness of each airport's curated data is graded so the airports still
needing work can be found.

## Requirements

### Requirement: An airport's country is always a country code

The system SHALL record an airport's country as its ISO 3166-1 alpha-2 code, identically for an
airport curated by hand and for one obtained from the external airport data provider. Where the
provider reports the country as a code, the system SHALL store that code as given rather than
resolving it to a name, so that no airport record ever carries a country name in place of a code.

#### Scenario: An imported airport records a country code

- **WHEN** an airport is imported from the external provider and the provider reports its country as the two-letter code `GB`
- **THEN** the stored airport's country is `GB`

#### Scenario: A provider lookup reports a country code

- **WHEN** an operations user looks an airport up through the external provider and the provider reports its country as the two-letter code `GB`
- **THEN** the response reports the country code as `GB`

#### Scenario: Imported and curated airports agree

- **WHEN** a response contains both a hand-curated airport and one imported from the provider
- **THEN** the country of each is an alpha-2 code, in the same form

### Requirement: An airport reports its country as a code and a name

The system SHALL report an airport's country as both its alpha-2 code and the catalogue name for
that code, wherever an airport is exposed — the airport list, a single airport, and the airports
embedded in other resources such as flights, aircraft, diversions and statistics — so that a caller
can group on the code and display the name without a second lookup. The name SHALL be resolved from
the country catalogue at read time and SHALL NOT be stored on the airport.

#### Scenario: A listed airport reports both

- **WHEN** a caller lists airports
- **THEN** each airport reports its country as the code and the catalogue name together, such as `DE` and `Germany`

#### Scenario: An embedded airport reports both

- **WHEN** a caller reads a resource that embeds an airport, such as a flight or an aircraft
- **THEN** the embedded airport reports its country as the code and the catalogue name together

#### Scenario: A renamed country needs no airport change

- **GIVEN** airports recording the country code `US`
- **WHEN** the catalogue name for `US` changes
- **THEN** every airport reports the new name without any airport record being written

### Requirement: An airport's country must be a known country

The system SHALL accept as an airport's country only a code the country catalogue recognises, and
SHALL reject anything else — a full country name, a value of any other length, an unassigned code,
and a code in the ISO 3166-1 user-assigned ranges — with a validation error, leaving the airport
unchanged. The system SHALL accept the code in any letter case and record it in upper case.

#### Scenario: A country name is no longer accepted

- **WHEN** an operations user supplies `Germany` as an airport's country
- **THEN** the request is rejected with a validation error and the airport is unchanged

#### Scenario: An unassigned code is rejected

- **WHEN** an operations user supplies the country `QQ`, which is not an assigned country code
- **THEN** the request is rejected with a validation error and no airport records `QQ`

#### Scenario: A user-assigned placeholder code is rejected

- **WHEN** a country value of `ZZ`, `XA`, `AA` or `QZ` is supplied for an airport
- **THEN** the request is rejected rather than recorded

#### Scenario: Letter case does not matter

- **WHEN** an operations user supplies `de` as an airport's country
- **THEN** the airport records `DE`

#### Scenario: An import carrying an unusable country fails loudly

- **WHEN** an airport is imported from the external provider and the provider reports a country the catalogue does not recognise
- **THEN** the import fails with an error naming the unrecognised value rather than storing it

### Requirement: Every airport carries a data quality grade

The system SHALL grade each airport's curated data as exactly one of `low`, `high` or `flagship`, and SHALL report that grade on every airport it exposes — the airport list, a single airport, and the airports embedded in other resources such as flights, aircraft and statistics. The grade describes how complete the curated data held for the airport is: its boundary shape, terminals, gates and runways taken together.

#### Scenario: A listed airport reports its grade

- **WHEN** a caller lists airports
- **THEN** every airport in the response reports its data quality grade

#### Scenario: An embedded airport reports its grade

- **WHEN** a caller reads a resource that embeds a full airport, such as a flight
- **THEN** the embedded airport reports its data quality grade

#### Scenario: The grade is visible to every reader of an airport

- **WHEN** any caller able to read an airport does so
- **THEN** the grade is part of the airport, with no separate permission required to see it

### Requirement: A new airport starts at the lowest grade

The system SHALL grade an airport `low` when no grade is supplied for it, so that an airport imported from the external provider — which arrives with no boundary shape, terminals, gates or runways — is marked as needing curation without anyone having to say so. The system SHALL accept an explicit grade when an airport is created, and SHALL NOT require one.

#### Scenario: An imported airport is graded low

- **WHEN** an airport is imported from the external provider
- **THEN** its data quality grade is `low`

#### Scenario: An airport created without a grade is graded low

- **WHEN** an operations user creates an airport and supplies no data quality grade
- **THEN** the created airport's grade is `low`

### Requirement: Only operations may change an airport's grade

The system SHALL allow an operations user to change an airport's data quality grade, and SHALL reject the same change from any other authenticated role as forbidden and from an unauthenticated caller as unauthorized. The system SHALL reject a grade that is not one of the three known values with a validation error naming the accepted values, and SHALL leave the airport unchanged in every rejected case.

#### Scenario: Operations raises an airport's grade

- **WHEN** an operations user sets an airport's data quality grade to `high`
- **THEN** the change succeeds and the returned airport reports the grade `high`

#### Scenario: An unknown grade is rejected

- **WHEN** an operations user sets an airport's data quality grade to a value that is not `low`, `high` or `flagship`
- **THEN** the request is rejected with a validation error listing the accepted values and the airport's grade is unchanged

#### Scenario: Cabin crew cannot change a grade

- **WHEN** a cabin crew user attempts to change an airport's data quality grade
- **THEN** the request is rejected as forbidden and the airport's grade is unchanged

#### Scenario: An unauthenticated caller cannot change a grade

- **WHEN** a request to change an airport's data quality grade carries no access token
- **THEN** the request is rejected as unauthorized and the airport's grade is unchanged

### Requirement: The grade is an editorial judgement, not a derived value

The system SHALL treat an airport's data quality grade as a value set by a person and SHALL NOT recompute or override it from the data held for the airport. Adding a boundary shape, terminals, gates or runways to an airport SHALL NOT change its grade, and changing its grade SHALL NOT require any of that data to be present.

#### Scenario: Curating an airport does not change its grade

- **WHEN** an operations user adds a boundary shape, a terminal or a runway to an airport
- **THEN** the airport's data quality grade is unchanged until someone changes it explicitly

#### Scenario: A grade can be raised before the data lands

- **WHEN** an operations user raises the grade of an airport that has no boundary shape
- **THEN** the change succeeds

### Requirement: Airports can be found by grade

The system SHALL allow the airport list to be filtered by data quality grade, returning only airports holding that grade, so that airports needing curation can be located. The filter SHALL be optional, SHALL combine with the other airport list filters, and SHALL reject an unknown grade with a validation error naming the accepted values.

#### Scenario: Filtering returns only matching airports

- **WHEN** a caller lists airports filtered by the grade `flagship` and exactly one airport holds that grade
- **THEN** the response contains only that airport

#### Scenario: No airport holds the requested grade

- **WHEN** a caller lists airports filtered by a grade that no airport holds
- **THEN** the response is an empty list

#### Scenario: An unknown grade filter is rejected

- **WHEN** a caller lists airports filtered by a grade that is not `low`, `high` or `flagship`
- **THEN** the request is rejected with a validation error listing the accepted values

#### Scenario: Omitting the filter lists every airport

- **WHEN** a caller lists airports without a data quality filter
- **THEN** every airport is returned regardless of grade
