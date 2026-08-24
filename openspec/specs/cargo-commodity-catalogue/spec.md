# cargo-commodity-catalogue

## Purpose

Hold a curated catalogue of one hundred commodities that move by air, each declaring its
handling codes, density, piece ranges, offload priority, seasonality and the airports,
countries or continents it comes from. Covers the rules for selecting which of them a flight
is offered, resolving its departure airport against the source tiers and its departure date
against the season, and the density that decides how a commodity fills a container.

## Requirements

### Requirement: The system carries a catalogue of one hundred commodities

The system SHALL hold curated reference data describing one hundred distinct commodities that
move by air, each declaring at minimum a name, one or more descriptions, its IATA special
handling codes, its density, its piece weight range and piece count range, its offload priority,
the months it moves in, and at least one source tier. Roughly thirty of them SHALL be dangerous
goods carrying a real UN number.

#### Scenario: The catalogue is complete and well formed

- **WHEN** the commodity catalogue is loaded
- **THEN** every entry declares a name, a density, a piece range, an offload priority and at least one month
- **AND** every entry either names at least one source tier or is declared available from anywhere

#### Scenario: Dangerous goods entries are fully described

- **WHEN** the catalogue is loaded
- **THEN** every entry declaring dangerous goods also declares a UN number, a proper shipping name, a hazard class and an emergency response code

#### Scenario: Special handling codes come from the vocabulary

- **WHEN** the catalogue is loaded
- **THEN** every special handling code used by an entry is one of the recognised IATA codes

### Requirement: A commodity declares where it comes from, at three levels

The system SHALL record a commodity's sources as any combination of specific airports, specific
countries and continents, so that a commodity may be tied tightly to a handful of airports or
loosely to a region.

#### Scenario: A commodity tied to specific airports

- **WHEN** a commodity that moves from a handful of named airports is read
- **THEN** those airport codes are reported as its sources

#### Scenario: A commodity available anywhere

- **WHEN** a commodity with no airport or country sources is read
- **THEN** it is reported as sourced from continents or as generic

### Requirement: Commodity selection resolves from the departure airport

The system SHALL select the commodities offered to a flight by resolving the departure airport
against the catalogue's source tiers, preferring an entry that names that airport, then one that
names its country, then one that names its continent, and finally a generic entry. Where no
entry matches at any tier, generic commodities SHALL be used.

#### Scenario: A flight from a named source airport

- **GIVEN** a commodity naming the flight's departure airport as a source
- **WHEN** commodities are selected for that flight
- **THEN** that commodity is among those offered

#### Scenario: A flight from an airport in a named country

- **GIVEN** a commodity naming the departure airport's country but not the airport
- **WHEN** commodities are selected for that flight
- **THEN** that commodity is among those offered

#### Scenario: A flight from an unremarkable airport

- **GIVEN** a departure airport matched by no airport, country or continent tier
- **WHEN** commodities are selected for that flight
- **THEN** generic commodities are offered and the selection is not empty

### Requirement: Commodity selection respects the season

The system SHALL offer a commodity only in the months it declares, using the flight's scheduled
departure date, so that a seasonal commodity does not appear out of season.

#### Scenario: A seasonal commodity in season

- **GIVEN** a commodity declaring the month of the flight's departure
- **WHEN** commodities are selected
- **THEN** that commodity may be offered

#### Scenario: A seasonal commodity out of season

- **GIVEN** a commodity that does not declare the month of the flight's departure
- **WHEN** commodities are selected
- **THEN** that commodity is not offered

### Requirement: A commodity's density decides how it fills a container

The system SHALL record a density for every commodity and SHALL use it to derive a shipment's
volume from its weight, so that a low-density commodity exhausts a container's volume before its
weight limit and a high-density one exhausts its weight limit first.

#### Scenario: A low-density commodity cubes out

- **GIVEN** a commodity whose density is below a container's break-even density
- **WHEN** it is loaded into a container
- **THEN** the container reaches its volume limit below its maximum gross weight

#### Scenario: A high-density commodity weighs out

- **GIVEN** a commodity whose density is above a container's break-even density
- **WHEN** it is loaded into a container
- **THEN** the container reaches its maximum gross weight with volume to spare

### Requirement: The catalogue is extendable without code changes

The system SHALL store the commodity catalogue as configuration data rather than in code, so
that adding a commodity, an airport source or a month requires editing data only. Adding an
entry that satisfies the catalogue's declared invariants SHALL require no other change.

#### Scenario: An added commodity is offered without code changes

- **WHEN** a well-formed commodity naming a departure airport is added to the catalogue
- **THEN** it is offered to flights departing that airport with no other change
