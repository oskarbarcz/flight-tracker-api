## ADDED Requirements

### Requirement: An ETOPS flight records the airports it could divert to

When a flight is created from a SimBrief operational flight plan carrying an ETOPS section, the
system SHALL store every airport the plan publishes as suitable for diversion, together with
the airports its diversion legs name. An airport appearing in more than one of these roles
SHALL be stored once.

#### Scenario: The plan's suitable airports are stored

- **WHEN** a flight is created from a plan publishing two ETOPS suitable airports
- **THEN** the flight reports both as airports it could divert to

#### Scenario: An airport named as both suitable and a diversion target

- **WHEN** an imported plan names the same airport in its suitable airport list and in a diversion leg
- **THEN** that airport is reported once

### Requirement: Each ETOPS airport records the period it must be usable

The system SHALL store the suitability window each ETOPS airport is assessed over — its start
and its end — together with the runway the plan assumes and the airport's transition altitude
and transition level. Windows SHALL be stored per airport, since the period one airport must
hold for is not the period another must hold for.

#### Scenario: Windows differ between airports

- **GIVEN** a plan whose first ETOPS airport must hold from 23:01 Z and whose second must hold from 00:52 Z, both until 02:52 Z
- **WHEN** the flight's ETOPS airports are read
- **THEN** each reports its own window, and the two windows differ

#### Scenario: The planned runway is reported

- **WHEN** an ETOPS airport is read
- **THEN** it reports the runway the plan assumes for it

### Requirement: The conditions forecast for the suitability window are stored

The system SHALL store the ceiling and visibility forecast for each ETOPS airport's suitability
window, since those are the conditions the diversion was planned against and they are
meaningless apart from the window they belong to.

#### Scenario: The forecast is reported against its window

- **WHEN** an ETOPS airport is read
- **THEN** it reports the ceiling and visibility forecast for its suitability window

### Requirement: No weather report is captured against the flight

The system SHALL NOT store the METAR, TAF, ATIS, observed conditions or flight category the
plan publishes for an ETOPS airport. An observation taken when the flight was planned is stale
before departure and answers no operational question the briefing exists to answer.

Current conditions at an ETOPS airport SHALL remain the responsibility of the airport weather
capability, so that one path serves current weather for every airport and the briefing reports
planning data only.

#### Scenario: The briefing reports no weather report

- **WHEN** an ETOPS airport is read as part of the briefing
- **THEN** it reports its window, planned runway and forecast conditions, and no METAR, TAF or ATIS

#### Scenario: Importing a plan does not alter current weather

- **GIVEN** an airport with current weather already recorded
- **WHEN** a flight is created from a plan publishing an older observation for that airport
- **THEN** the airport's current weather is unchanged

### Requirement: An ETOPS airport is reported without a legality verdict

The system SHALL report an ETOPS airport's forecast conditions and suitability window without
asserting that the airport meets its planning minima, because the plan publishes no minima in
machine-readable form. The word describing an airport's role SHALL NOT be presented as an
assessment of its usability.

#### Scenario: No suitability verdict is claimed

- **WHEN** an ETOPS airport is read
- **THEN** its forecast conditions and window are reported, and no field asserts that the airport meets its minima
