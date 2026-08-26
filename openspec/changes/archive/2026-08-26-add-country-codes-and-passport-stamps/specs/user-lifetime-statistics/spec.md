## MODIFIED Requirements

### Requirement: Break statistics down per airport and geography

The system SHALL expose the distinct airports, countries, and continents the pilot has
visited, the visit count per airport, and the most-visited airport. Countries SHALL be counted
by alpha-2 code, so that two airports in the same country count once however that country is
spelled, and the most-visited airport SHALL report its country as a code and the catalogue name
together.

#### Scenario: Distinct airports, countries, and continents are counted

- **WHEN** a pilot who has flown to airports across two countries and one continent requests their geography
- **THEN** the distinct airport, country, and continent counts are reported

#### Scenario: Two airports in one country count as one country

- **WHEN** a pilot has visited two airports both in Germany
- **THEN** the distinct country count counts `DE` once

#### Scenario: The most-visited airport is identified

- **WHEN** a pilot has visited one airport more often than any other
- **THEN** that airport is reported as most-visited, with its country as a code and name
