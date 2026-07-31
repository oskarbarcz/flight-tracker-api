# airport-data-curation Specification

## Purpose

Keeps airport records consistent whatever their origin: fields arriving from the
external airport data provider are normalised into the project's own vocabulary, and
the completeness of each airport's curated data is graded so the airports still
needing work can be found.

## Requirements

### Requirement: An airport's country is always a country name

The system SHALL express an airport's country as a full English country name, identically for an airport curated by hand and for one obtained from the external airport data provider. When the provider reports the country as a two-letter ISO 3166-1 alpha-2 code, the system SHALL resolve that code to its country name before the value is stored or returned, so that no airport record ever carries a country code in place of a name.

#### Scenario: An imported airport records a country name

- **WHEN** an airport is imported from the external provider and the provider reports its country as the two-letter code `GB`
- **THEN** the stored airport's country is `United Kingdom`

#### Scenario: A provider lookup reports a country name

- **WHEN** an operations user looks an airport up through the external provider and the provider reports its country as the two-letter code `GB`
- **THEN** the response reports the country as `United Kingdom`

#### Scenario: Imported and curated airports agree

- **WHEN** a response contains both a hand-curated airport and one imported from the provider
- **THEN** the country of each is a country name, in the same form

### Requirement: Country resolution never invents a country

The system SHALL leave the provider's country value untouched whenever it is not a resolvable two-letter country code — including a value that is already a country name, a value of any other length, and an unassigned code. The system SHALL treat the ISO 3166-1 user-assigned ranges (`AA`, `ZZ`, `QM` through `QZ`, and `XA` through `XZ`) as unresolvable, because they are placeholders whose underlying reference data maps them to non-country labels that MUST NOT be stored as an airport's country.

#### Scenario: An unassigned code is kept as-is

- **WHEN** the provider reports a country value of `QQ`, which is not an assigned country code
- **THEN** the airport records `QQ` unchanged, and no country name is guessed

#### Scenario: A user-assigned placeholder code is not resolved

- **WHEN** the provider reports a country value of `ZZ`, `XA`, `AA` or `QZ`
- **THEN** the airport records that value unchanged rather than a placeholder label such as `Unknown Region` or `Pseudo-Accents`

#### Scenario: Resolution is repeatable

- **WHEN** a country value that is already a country name, such as `Germany`, is resolved again
- **THEN** the value is unchanged, so resolving an already-resolved airport is harmless

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
