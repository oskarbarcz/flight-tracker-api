## MODIFIED Requirements

### Requirement: Commodity selection resolves from the departure airport

The system SHALL select the commodities offered to a flight by resolving the departure airport
against the catalogue's source tiers, preferring an entry that names that airport, then one that
names its country, then one that names its continent, and finally a generic entry. The country tier
SHALL match on the departure airport's alpha-2 country code, so a commodity declares its source
countries as codes rather than names. Where no entry matches at any tier, generic commodities SHALL
be used.

#### Scenario: A flight from a named source airport

- **GIVEN** a commodity naming the flight's departure airport as a source
- **WHEN** commodities are selected for that flight
- **THEN** that commodity is among those offered

#### Scenario: A flight from an airport in a named country

- **GIVEN** a commodity naming the departure airport's country code but not the airport
- **WHEN** commodities are selected for that flight
- **THEN** that commodity is among those offered

#### Scenario: A commodity declares its source countries as codes

- **WHEN** a commodity sourced from Kenya and Colombia is read
- **THEN** its source countries are reported as `KE` and `CO`

#### Scenario: A flight from an unremarkable airport

- **GIVEN** a departure airport matched by no airport, country or continent tier
- **WHEN** commodities are selected for that flight
- **THEN** generic commodities are offered and the selection is not empty
