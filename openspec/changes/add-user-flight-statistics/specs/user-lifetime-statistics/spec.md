## ADDED Requirements

### Requirement: Expose lifetime totals

The system SHALL expose, per authenticated pilot, lifetime totals computed only from that
pilot's completed flights: great-circle distance flown (nautical miles), airborne time,
block time, number of flights, number of cycles (always equal to the flight count — one
completed sector is one cycle), and fuel burned. `GET /user/me/stats` SHALL continue to
return at least the previously published totals (distance, flight time, fuel) so existing
clients do not break.

#### Scenario: A pilot with completed flights sees summed totals

- **WHEN** an authenticated pilot with completed flights requests their statistics
- **THEN** the response reports the summed distance, airborne time, block time, flight count, cycles, and fuel

#### Scenario: A pilot with no completed flights sees zeros

- **WHEN** an authenticated pilot who has flown nothing requests their statistics
- **THEN** every lifetime total is zero

#### Scenario: The legacy stats response shape is preserved

- **WHEN** a client calls `GET /user/me/stats`
- **THEN** the response still contains the previously published total distance, flight time, and fuel fields

### Requirement: Expose personal records

The system SHALL expose the pilot's longest completed flight by distance and by duration,
and the dates of their first and last completed flight.

#### Scenario: Longest flight by distance and by duration are reported

- **WHEN** a pilot with several completed flights requests their records
- **THEN** the longest-by-distance and longest-by-duration flights are reported
- **AND** the first and last completed-flight dates are reported

#### Scenario: Records are empty for a pilot with no flights

- **WHEN** a pilot with no completed flights requests their records
- **THEN** the records are reported as empty

### Requirement: Break statistics down per aircraft type

The system SHALL expose, per aircraft type the pilot has flown (ICAO type code), the number
of flights, distance, airborne time, and block time on that type, plus the first and last
dates flown; and SHALL identify the pilot's most-flown type.

#### Scenario: Hours per type are reported

- **WHEN** a pilot who has flown the A320 and the B738 requests their per-type breakdown
- **THEN** each type reports its own flight count, distance, airborne time, and block time

#### Scenario: A type never flown does not appear

- **WHEN** a pilot has never flown the B744
- **THEN** the B744 does not appear in their per-type breakdown

### Requirement: Break statistics down per airport and geography

The system SHALL expose the distinct airports, countries, and continents the pilot has
visited, the visit count per airport, and the most-visited airport.

#### Scenario: Distinct airports, countries, and continents are counted

- **WHEN** a pilot who has flown to airports across two countries and one continent requests their geography
- **THEN** the distinct airport, country, and continent counts are reported

#### Scenario: The most-visited airport is identified

- **WHEN** a pilot has visited one airport more often than any other
- **THEN** that airport is reported as most-visited

### Requirement: Expose the most-flown airline

The system SHALL expose the operator (airline) the pilot has flown most often.

#### Scenario: Most-flown airline is reported

- **WHEN** a pilot has flown more flights for one operator than any other
- **THEN** that operator is reported as their most-flown airline
