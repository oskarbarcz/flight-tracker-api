## Purpose

The airports an ETOPS flight could divert to, each with the window it must remain usable for and
the conditions forecast for that window. Planning data as the dispatcher saw it, reported
without asserting that an airport is legally usable.

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

### Requirement: An airport holds one role in the flight's airport list

The flight's airport list SHALL record each airport once, under a single role. Where an airport
holds several roles on one flight — an exit threshold airport that is also its own diversion
target, or an enroute alternate that is also an ETOPS suitable airport — the list SHALL keep the
more specific role and SHALL NOT record the airport twice.

The precise relationship between an ETOPS point and its adequate and suitable airports is
carried by the ETOPS point and its diversion legs, not by this list, which records only that an
airport is relevant to the flight.

#### Scenario: An airport that is both the exit airport and its own diversion target

- **GIVEN** an exit point whose adequate airport and whose diversion leg both name the same airport
- **WHEN** the flight's airport list is read
- **THEN** that airport appears once, as the ETOPS exit airport

#### Scenario: An airport that is both an enroute alternate and an ETOPS suitable airport

- **GIVEN** a plan naming one airport as its enroute alternate and among its ETOPS suitable airports
- **WHEN** the flight's airport list is read
- **THEN** that airport appears once, as the enroute alternate

#### Scenario: The point still names both of its airports

- **GIVEN** an exit point whose adequate airport and diversion target are the same airport
- **WHEN** that ETOPS point and its diversion leg are read
- **THEN** both name that airport, independently of how the flight's airport list records it

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
