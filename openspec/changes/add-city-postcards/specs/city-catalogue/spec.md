## Purpose

Gives a city an identity of its own, so that things which belong to a city — a collectible,
a visit, a statistic — belong to a record rather than to a line of imported text that may
be rewritten upstream at any time.

## ADDED Requirements

### Requirement: A city is identified by a value that reveals nothing about it

The system SHALL identify every city by a stable identifier that encodes nothing about the
city it names, so that knowing one city's identifier tells a caller nothing about any
other and no identifier can be derived from a city's name or country. The identifier SHALL
remain the same for the life of the city, so that anything referring to a city keeps
referring to it.

#### Scenario: A city's identifier cannot be guessed from its name

- **GIVEN** a city named Paris in France
- **THEN** its identifier cannot be derived from its name, its country, or any other city's identifier

#### Scenario: An identifier survives a rename

- **GIVEN** a city whose name is corrected
- **THEN** its identifier is unchanged and everything referring to that city still refers to it

### Requirement: A city is one record per name within a country

The system SHALL treat a city name within a country as identifying exactly one city, so
that two airports described as being in the same city of the same country belong to one
city record and never to two. Two cities of the same name in different countries SHALL be
distinct cities.

#### Scenario: Two airports in one city share it

- **GIVEN** an airport described as being in London, United Kingdom
- **WHEN** a second airport described as being in London, United Kingdom is added
- **THEN** both airports belong to the same city

#### Scenario: The same name in two countries is two cities

- **GIVEN** an airport in a city named Springfield in the United States
- **WHEN** an airport in a city named Springfield in another country is added
- **THEN** the two airports belong to different cities

### Requirement: An airport names its city and the city is created if it is unknown

The system SHALL accept an airport's city as a name when the airport is created or
imported, resolving it to the existing city of that name and country where one exists and
creating the city where none does. A caller creating an airport SHALL NOT be required to
know whether the city already exists, and SHALL NOT be required to supply a city
identifier.

#### Scenario: An airport in a new city creates it

- **WHEN** an airport is created naming a city that no existing airport is in
- **THEN** the city is created and the airport belongs to it

#### Scenario: An airport in a known city reuses it

- **GIVEN** an existing city with an airport already in it
- **WHEN** another airport is created naming that same city and country
- **THEN** no second city is created and the new airport belongs to the existing one

#### Scenario: An imported airport resolves its city

- **WHEN** an airport is imported by its ICAO code and the upstream source names its city
- **THEN** the airport belongs to a city of that name in that country, created if it did not exist

### Requirement: An airport reports the city it belongs to

The system SHALL report an airport's city as a record naming both its identifier and its
name, so that a caller reading an airport can reach the city itself rather than only its
name, consistently with how an airport already reports its country.

#### Scenario: An airport read names its city

- **WHEN** an airport is read
- **THEN** its city is reported with both an identifier and a name

#### Scenario: Two airports in one city report the same city

- **GIVEN** two airports belonging to the same city
- **WHEN** each is read
- **THEN** both report the same city identifier

### Requirement: Cities existing before this capability are derived from their airports

The system SHALL derive a city for every airport that named one before cities were
records, so that no airport is left without a city and no city is invented that no airport
is in. If any airport cannot be given a city, the derivation SHALL fail rather than leave
the catalogue partially populated.

#### Scenario: Every existing airport gains a city

- **GIVEN** airports naming cities as text before this capability existed
- **WHEN** the catalogue is derived
- **THEN** every airport belongs to a city, and each distinct name and country pair is one city

#### Scenario: An airport that cannot be placed fails the derivation

- **GIVEN** an airport whose city cannot be determined
- **WHEN** the catalogue is derived
- **THEN** the derivation fails and no partial catalogue is left behind
