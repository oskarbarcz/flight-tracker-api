## Purpose

Records which city a pilot landed in on each flight, so that a pilot's travel can be read
at city granularity — every city reached, when it was first reached, and how many times it
has been reached since — and so that a first arrival is identifiable as the moment a
collectible is earned.

## ADDED Requirements

### Requirement: An arrival records the city the pilot landed in

The system SHALL record a visit when a pilot's flight reports on-block, naming the city of
the airport the aircraft landed at, the flight, the airport, and the moment the flight
completed. Only the city landed in SHALL be recorded: departing a city is not a visit, so a
flight SHALL produce exactly one visit regardless of how many airports it names.

#### Scenario: An arrival records the destination city

- **WHEN** a pilot completes a flight from an airport in Frankfurt to an airport in Paris
- **THEN** one visit is recorded for Paris, and none for Frankfurt

#### Scenario: A flight between two airports of one city records one visit

- **WHEN** a pilot completes a flight between two airports belonging to the same city
- **THEN** exactly one visit is recorded for that city

#### Scenario: A visit carries where and when

- **WHEN** a pilot completes a flight
- **THEN** the visit records the city, the flight, the airport landed at, and the flight's completion time

### Requirement: A diverted flight records the city where the aircraft landed

The system SHALL record the city of the airport the aircraft actually landed at, so that a
flight diverted elsewhere records a visit to the city it reached and not to the one it was
planned to reach.

#### Scenario: A diversion records the diversion city

- **GIVEN** a flight planned from Frankfurt to Paris that diverts to an airport in Brussels
- **WHEN** the flight reports on-block
- **THEN** one visit is recorded for Brussels, and none for Paris

#### Scenario: A diversion within the planned city records it once

- **GIVEN** a flight planned to one airport of a city that diverts to another airport of the same city
- **WHEN** the flight reports on-block
- **THEN** exactly one visit is recorded for that city

### Requirement: A flight records at most one visit per pilot

The system SHALL record at most one visit per pilot per flight, so that a completion event
delivered more than once, or a flight that reports on-block and is later closed, does not
count twice. The system SHALL attribute the visit to the flight's captain, since that is
the pilot who flew it; a flight with no captain SHALL record no visit.

#### Scenario: A repeated completion event does not double-count

- **GIVEN** a completed flight that has already recorded its captain's visit
- **WHEN** the completion is processed again
- **THEN** exactly one visit remains for that flight

#### Scenario: The captain is credited, not the dispatcher

- **GIVEN** a flight created by an operations user and flown by a cabin crew captain
- **WHEN** the flight completes
- **THEN** the captain has a visit recorded and the operations user has none

#### Scenario: An uncrewed flight records nothing

- **WHEN** a flight with no captain completes
- **THEN** no visit is recorded

### Requirement: A pilot's visited cities report their counts and dates

The system SHALL expose the pilot's own visited cities: one entry per city visited,
reporting the city, its country, the number of visits, the first visit and the most recent
visit. Entries SHALL be ordered by first visit, oldest first, so the list reads in the
order the cities were first reached. A pilot who has visited no city SHALL receive an empty
list rather than an error.

#### Scenario: A visited city is reported with its counts

- **GIVEN** a pilot who has landed in Paris three times
- **WHEN** they read their visited cities
- **THEN** Paris is reported with three visits, the date of the first and the date of the most recent

#### Scenario: The list reads in first-visit order

- **GIVEN** a pilot who first landed in Paris, then in Frankfurt
- **WHEN** they read their visited cities
- **THEN** Paris is listed before Frankfurt

#### Scenario: A city never visited is absent

- **GIVEN** a pilot who has never landed in Warsaw
- **WHEN** they read their visited cities
- **THEN** Warsaw does not appear

#### Scenario: A pilot who has never flown has an empty list

- **WHEN** a pilot with no completed flights reads their visited cities
- **THEN** the list is empty and the request succeeds

### Requirement: Visited cities belong to the pilot who reads them

The system SHALL scope every visited-cities read to the authenticated caller, so that a
caller reads their own cities and never another pilot's, and SHALL reject an
unauthenticated read as unauthorized. Any authenticated role SHALL be able to read its own
visited cities.

#### Scenario: A pilot reads their own cities

- **WHEN** an authenticated pilot reads their visited cities
- **THEN** the response holds their own visits and no other pilot's

#### Scenario: Cabin crew may read their visited cities

- **WHEN** a cabin crew user reads their visited cities
- **THEN** the request succeeds

#### Scenario: An administrator may read their visited cities

- **WHEN** an administrator reads their visited cities
- **THEN** the request succeeds

#### Scenario: An unauthenticated caller cannot read visited cities

- **WHEN** a request for visited cities carries no access token
- **THEN** the request is rejected as unauthorized

### Requirement: Visits are backfilled from flights already completed

The system SHALL record visits for flights completed before this capability existed,
deriving each from the flight's captain, its completion time and the airport it landed at —
the diversion airport where the flight diverted — so that a pilot's cities reflect their
whole history rather than starting empty. The backfill SHALL produce the same visits a live
arrival would have produced, and SHALL leave the record unchanged if run again.

#### Scenario: History appears in the visited cities

- **GIVEN** a pilot whose completed flights landed in Paris and Frankfurt before this capability existed
- **WHEN** they read their visited cities
- **THEN** both cities are listed, dated by when those flights completed

#### Scenario: A historical diversion is recorded where it landed

- **GIVEN** a completed flight that diverted to an airport in another city
- **WHEN** visits are backfilled
- **THEN** the visit names the city the flight diverted to

#### Scenario: Backfilling twice changes nothing

- **WHEN** the backfill runs a second time
- **THEN** the same visits are held, with no duplicates
