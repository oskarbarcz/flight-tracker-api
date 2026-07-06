## ADDED Requirements

### Requirement: Record captained aircraft at pilot check-in

The system SHALL create a `user_aircraft` record whenever a pilot checks in for a
flight, associating the checking-in user with the flight's aircraft and the flight.
The record SHALL store only the user, aircraft, and flight references plus a creation
timestamp; display attributes (registration, airframe, livery, operator) SHALL NOT be
duplicated into the record and SHALL be resolved by join at read time. Because the
check-in actor becomes the flight's captain, this record represents a flight the user
captained.

#### Scenario: Pilot checks in for a flight

- **WHEN** a `PilotCheckedIn` event is emitted for a user, aircraft, and flight
- **THEN** a `user_aircraft` row is created with that `userId`, `aircraftId`, and `flightId`
- **AND** the row records the time it was created

#### Scenario: One record per captained flight

- **WHEN** a user has captained several flights, including repeated use of the same aircraft
- **THEN** a distinct `user_aircraft` row exists for each captained flight
- **AND** the same aircraft appears once per flight rather than being de-duplicated

### Requirement: Retrieve the current user's flown-aircraft history

The system SHALL expose `GET /api/v1/user/me/aircraft`, returning the authenticated
user's flown-aircraft history derived from their `user_aircraft` records. The endpoint
SHALL require authentication and SHALL scope results to the requesting user only
(identified from the JWT), with no user id in the path. Each entry SHALL include the
aircraft id, registration, resolved airframe, livery, the operator of the flight, and
the flight id. Entries SHALL be ordered most-recent first and SHALL include flights of
any status, including one currently in progress.

#### Scenario: User lists aircraft they have flown

- **WHEN** an authenticated user sends `GET /api/v1/user/me/aircraft`
- **THEN** the response contains one entry per flight the user has captained
- **AND** each entry includes `id`, `registration`, `airframe`, `livery`, `operator`, and `flightId`
- **AND** entries are ordered from most recent to oldest

#### Scenario: Operator reflects the flight, not the aircraft

- **WHEN** a user captained the same aircraft on flights operated by different operators
- **THEN** each entry's `operator` is the operator of that entry's flight

#### Scenario: In-progress flight is included

- **WHEN** a user has captained a flight that has not yet completed
- **THEN** that flight's aircraft appears in the response

#### Scenario: Request without authentication is rejected

- **WHEN** an unauthenticated request is sent to `GET /api/v1/user/me/aircraft`
- **THEN** the system responds with 401 Unauthorized

#### Scenario: User with no captained flights

- **WHEN** an authenticated user who has never captained a flight sends the request
- **THEN** the response is an empty list

### Requirement: Backfill history from existing flights

The system SHALL, as part of introducing the `user_aircraft` table, create one record
for every existing flight that has a captain, regardless of flight status. Flights
without a captain SHALL NOT produce a record.

#### Scenario: Existing captained flights are backfilled

- **WHEN** the migration that introduces `user_aircraft` runs against a database with existing flights
- **THEN** a `user_aircraft` row is created for each flight whose `captain_id` is set
- **AND** each row references that flight's captain, aircraft, and flight

#### Scenario: Flights without a captain are skipped

- **WHEN** the backfill runs and a flight has no `captain_id`
- **THEN** no `user_aircraft` row is created for that flight
