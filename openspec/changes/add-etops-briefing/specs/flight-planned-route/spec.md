## Purpose

The line a flight is planned to fly, stored as ordered fixes with their positions, altitudes and
elapsed times, so the route can be drawn from airport to airport and the ETOPS points placed
along it. What was planned, distinct from the positions the aircraft actually reports.

## ADDED Requirements

### Requirement: A flight stores the planned route as positioned fixes

When a flight is created from a SimBrief operational flight plan, the system SHALL store the
plan's route fixes in the order they are flown, each with its identifier, its position, the
planned altitude, the elapsed time from departure at which it is reached, the airway used to
reach it, and the stage of flight it belongs to.

The route stored SHALL be the planned route. It SHALL NOT replace or be confused with the
positions the aircraft actually reports in flight, which describe where the aircraft went
rather than where it was planned to go.

#### Scenario: The planned route is stored in order

- **WHEN** a flight is created from a plan whose route has 26 fixes
- **THEN** the flight reports 26 route fixes in the order they are flown, each with a position

#### Scenario: The planned route is available before departure

- **GIVEN** a flight created from a plan whose aircraft has not yet moved
- **WHEN** the flight's planned route is read
- **THEN** the full route is reported, although no position reports exist

#### Scenario: Planned route and flown positions are distinct

- **GIVEN** a flight that has reported positions in flight
- **WHEN** the flight's planned route is read
- **THEN** the planned route is reported unchanged by what the aircraft actually flew

#### Scenario: A flight not created from a plan has no planned route

- **WHEN** a flight created without an operational flight plan is read
- **THEN** it reports no planned route

### Requirement: Every route fix is positioned well enough to draw

The system SHALL store a latitude and a longitude for every route fix, at the precision the
plan publishes, and SHALL NOT store a fix without a position. A route SHALL be drawable from
the stored fixes alone, without consulting a navigation database to resolve an identifier.

The system SHALL store the points at which the flight tops its climb and begins its descent
along with the navigation waypoints, since they carry positions of their own and mark where the
planned altitude changes character.

#### Scenario: No fix lacks a position

- **WHEN** a flight's planned route is read
- **THEN** every fix reports a latitude and a longitude

#### Scenario: The route needs no navigation database to draw

- **WHEN** a flight's planned route is read
- **THEN** the fixes can be drawn in order from their stored positions alone

#### Scenario: The climb and descent points are part of the route

- **WHEN** a flight's planned route is read
- **THEN** the top of climb and top of descent are reported among the fixes, each with a position and a planned altitude

#### Scenario: The altitude profile is drawable

- **WHEN** a flight's planned route is read
- **THEN** every fix reports its planned altitude, so the vertical profile can be drawn from the same fixes

### Requirement: The departure airport is stored as the route's first fix

The plan's route fixes begin after departure and do not include the origin airport, although
they do include the destination. The system SHALL store the departure airport as the first fix
of the planned route, positioned at the airport's own coordinates, at field elevation, at zero
elapsed time, so that the stored route runs from airport to airport and needs no correction
when it is read.

#### Scenario: The departure airport is the first fix

- **GIVEN** a flight whose plan's first route fix lies 30 nm from the departure airport
- **WHEN** the flight's planned route is read
- **THEN** its first fix is the departure airport, at the airport's own position, followed by that plan fix

#### Scenario: The route runs airport to airport

- **WHEN** a flight's planned route is read
- **THEN** its first fix is the departure airport and its final fix is the destination airport

#### Scenario: The departure fix reports the start of the flight

- **WHEN** a flight's planned route is read
- **THEN** its first fix reports zero elapsed time and the departure airport's field elevation

#### Scenario: The stored route needs no correction to draw

- **WHEN** a flight's planned route is read
- **THEN** the fixes can be drawn in order as stored, with no gap between the departure airport and the first plan fix

### Requirement: The route identifies the segment flown on an oceanic track

The system SHALL record the airway used to reach each route fix, so that the segment of the
route following an oceanic track can be distinguished from the rest.

#### Scenario: Track segment is identifiable

- **GIVEN** a flight routed along an oceanic track for six of its fixes
- **WHEN** the flight's planned route is read
- **THEN** those six fixes report the track as the airway used to reach them, and the remaining fixes do not
