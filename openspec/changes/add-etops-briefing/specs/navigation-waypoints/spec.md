## Purpose

A catalogue of named waypoints and navaids with their positions, accumulated from every flight
plan imported, so the system builds its own navigation data from the plans it already reads
rather than depending on a navigation database it does not have.

## ADDED Requirements

### Requirement: Waypoints are accumulated from every imported flight plan

The system SHALL keep a catalogue of navigation waypoints, recording each waypoint's
identifier, its position, its kind and the ICAO region it belongs to. Every operational flight
plan imported SHALL contribute the waypoints it publishes with coordinates, so that the
catalogue grows with use rather than being loaded from a navigation database the system does
not have.

A waypoint already catalogued SHALL be updated rather than duplicated, and its position SHALL
be refreshed from the most recent plan that published it.

#### Scenario: An import contributes its waypoints

- **WHEN** a flight is created from a plan whose route publishes named waypoints with coordinates
- **THEN** those waypoints are catalogued with their positions, kinds and regions

#### Scenario: A waypoint seen again is not duplicated

- **GIVEN** a waypoint already catalogued from an earlier flight
- **WHEN** another plan publishes the same waypoint
- **THEN** the catalogue still holds one entry for it

#### Scenario: Waypoints from alternate routes are contributed too

- **WHEN** a plan publishes routes to its alternates
- **THEN** the waypoints along those routes are catalogued alongside the main route's

#### Scenario: Oceanic track waypoints are contributed

- **WHEN** a plan publishes an organised track structure whose tracks name waypoints with coordinates
- **THEN** those waypoints are catalogued

### Requirement: Identifiers are qualified by region

Waypoint identifiers are not unique worldwide. The system SHALL identify a catalogued waypoint
by its identifier together with the ICAO region the plan reports for it, so that two waypoints
sharing a name in different parts of the world remain distinct.

Where a plan publishes a waypoint with no region — as oceanic track structures do — the system
SHALL catalogue it without one and SHALL NOT invent a region for it.

#### Scenario: The same identifier in two regions

- **GIVEN** two plans publishing the same waypoint identifier in different ICAO regions
- **WHEN** the catalogue is read
- **THEN** both are held, distinguished by region

#### Scenario: A waypoint published without a region

- **WHEN** a plan publishes a track waypoint carrying no region
- **THEN** it is catalogued without a region

### Requirement: Computed points are not catalogued

The system SHALL NOT catalogue points a plan computes for one particular flight rather than
published navigation waypoints: the top of climb, the top of descent, and positions named after
their own coordinates. These describe where one aircraft happened to be and are either
different on the next flight or derivable from their own name, so they are of no use to a later
flight.

Airports SHALL NOT be catalogued as waypoints either, being already held as airports.

#### Scenario: Top of climb and top of descent are skipped

- **WHEN** a flight is created from a plan whose route includes a top of climb and a top of descent
- **THEN** neither is catalogued as a waypoint

#### Scenario: A position named after its coordinates is skipped

- **WHEN** a plan publishes a route point whose identifier is its own latitude and longitude
- **THEN** it is not catalogued

#### Scenario: Airports on the route are skipped

- **WHEN** a plan's route begins and ends at an airport
- **THEN** neither airport is catalogued as a waypoint

### Requirement: Navaids carry the frequency the plan reports

Where a plan reports a radio frequency for a waypoint, the system SHALL record it, so that a
catalogued navaid can be identified as such and tuned.

#### Scenario: A navaid is catalogued with its frequency

- **WHEN** a plan publishes a VOR on the route with its frequency
- **THEN** that waypoint is catalogued as a navaid carrying that frequency

#### Scenario: A waypoint without a frequency

- **WHEN** a plan publishes a named waypoint with no frequency
- **THEN** it is catalogued with no frequency

### Requirement: The catalogue is readable

The system SHALL let an authenticated user read a catalogued waypoint by its identifier, so
that the catalogue can be used to resolve a waypoint named without coordinates.

#### Scenario: Reading a catalogued waypoint

- **WHEN** an authenticated user reads a waypoint the catalogue holds
- **THEN** its position, kind and region are reported

#### Scenario: Reading an identifier the catalogue has never seen

- **WHEN** an authenticated user reads a waypoint that no imported plan has published
- **THEN** the request reports that the waypoint is not known
