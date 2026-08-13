# airport-notams

## Purpose

Store the NOTAMs of an airport as they are published in an imported SimBrief operational
flight plan, keep the stored set for a planned airport in step with the plan that was just
imported, and serve the NOTAMs currently in force at an airport over a public read
endpoint.

## Requirements

### Requirement: An airport holds many NOTAMs

The system SHALL store NOTAMs per airport, many per airport, each recording the NOTAM's
identifier as issued, its creation, effective, expiry, and last-modified times, the time it
was last imported from the source, its highlighted HTML body, its plain-text body, its raw
NOTAM as issued, its NOTAM record type (new, replacement, or cancellation), its Q-code, and
the decoded Q-code category, subject, and status. The expiry time SHALL be optional, absent
for a NOTAM published with no stated end. A NOTAM identifier SHALL be unique per airport.
Deleting an airport SHALL delete its NOTAMs.

#### Scenario: A NOTAM records every published field

- **WHEN** a NOTAM is stored for an airport
- **THEN** its identifier, creation time, effective time, expiry time, last-modified time, HTML body, text body, raw body, record type, Q-code, and decoded Q-code category, subject, and status are all retained as published

#### Scenario: A NOTAM with no stated end has no expiry

- **WHEN** a published NOTAM carries no expiry time
- **THEN** it is stored with no expiry rather than being rejected or given a substitute date

#### Scenario: The same NOTAM is not stored twice for one airport

- **WHEN** a set of NOTAMs to store for an airport contains the same NOTAM identifier more than once
- **THEN** the airport ends up with a single NOTAM for that identifier

#### Scenario: An airport's NOTAMs go with the airport

- **WHEN** an airport is removed
- **THEN** the NOTAMs stored for it are removed with it

### Requirement: NOTAMs are ingested from an imported SimBrief flight plan

When a flight is created from a SimBrief operational flight plan, the system SHALL store
the NOTAMs the plan publishes for each of its airports: the origin, the destination, every
destination alternate, the takeoff alternate, the enroute alternate, and every ETOPS
suitable airport. NOTAMs SHALL be taken from the plan's per-airport NOTAM data, which
carries the highlighted HTML body and the decoded Q-code fields. The system SHALL NOT
store NOTAMs published for non-airport locations such as flight information regions.
Ingestion SHALL complete as part of the flight-creation request.

#### Scenario: The planned airports receive their NOTAMs

- **WHEN** a flight is created from a plan publishing NOTAMs for its origin and destination
- **THEN** each of those airports has exactly the NOTAMs the plan published for it, with every field as published

#### Scenario: Alternates and ETOPS airports are included

- **WHEN** an imported plan publishes NOTAMs for a destination alternate, an enroute alternate, and an ETOPS suitable airport
- **THEN** those airports receive their NOTAMs too, not only the origin and destination

#### Scenario: An airport the plan mentions but the system does not know is skipped

- **WHEN** an imported plan publishes NOTAMs for an airport that has no record in the system
- **THEN** those NOTAMs are discarded, no airport is created for them, and the rest of the import completes normally

#### Scenario: An airport appearing in two roles receives one set of NOTAMs

- **WHEN** an imported plan lists the same airport in two roles, such as a destination alternate that is also an ETOPS suitable airport, and publishes its NOTAMs under both
- **THEN** the airport receives each of those NOTAMs once

#### Scenario: NOTAMs are visible as soon as the flight exists

- **WHEN** a create-flight-from-SimBrief request returns successfully
- **THEN** the NOTAMs for the plan's airports are already readable

#### Scenario: Region-level NOTAMs are not stored

- **WHEN** an imported plan carries NOTAMs issued for a flight information region rather than an airport
- **THEN** no NOTAMs are stored for them

### Requirement: Ingestion replaces the stored NOTAMs of the planned airports only

For every airport of an imported plan, the system SHALL replace that airport's stored
NOTAMs with the set the plan publishes, discarding what was stored before, so that no
superseded NOTAM survives. An airport the plan publishes no NOTAMs for SHALL end up with
none stored. Airports absent from the plan SHALL keep their stored NOTAMs unchanged. The
replacement SHALL be atomic: a reader SHALL never observe an airport with a partial set.

#### Scenario: A superseded NOTAM does not survive a re-import

- **WHEN** a plan is imported for an airport that already has stored NOTAMs, and the plan no longer publishes one of them
- **THEN** that NOTAM is no longer stored for the airport and the plan's current NOTAMs are

#### Scenario: Re-importing the same plan does not duplicate NOTAMs

- **WHEN** the same plan is imported twice
- **THEN** each of its airports holds the same NOTAMs as after the first import, with no duplicates

#### Scenario: An airport with nothing to report is cleared

- **WHEN** a plan is imported for an airport that has stored NOTAMs but the plan publishes none for it
- **THEN** the airport has no stored NOTAMs afterwards

#### Scenario: Other airports are untouched

- **WHEN** a plan is imported that does not mention a given airport
- **THEN** that airport's stored NOTAMs are unchanged

### Requirement: Retrieve the NOTAMs in force at an airport

The system SHALL expose `GET /api/v1/airport/:airportId/notam` returning the NOTAMs
currently in force at the airport identified by its UUID — those with no expiry, and those
whose expiry is in the future. Expired NOTAMs SHALL NOT be returned. NOTAMs SHALL be
ordered by effective time, most recent first. Each returned NOTAM SHALL carry its
identifier, creation, effective, expiry, and last-modified times, its import time, HTML
body, text body, raw body, record type, Q-code, and decoded Q-code category, subject, and
status. The endpoint SHALL be available without authentication.

#### Scenario: An airport with NOTAMs in force

- **WHEN** an unauthenticated client requests the NOTAMs of an airport that has NOTAMs in force
- **THEN** the system responds `200 OK` with those NOTAMs, each carrying all of its stored fields

#### Scenario: Expired NOTAMs are omitted

- **WHEN** an airport holds both NOTAMs whose expiry has passed and NOTAMs still in force
- **THEN** only the NOTAMs still in force are returned

#### Scenario: A NOTAM with no expiry is always in force

- **WHEN** an airport holds a NOTAM with no expiry time
- **THEN** that NOTAM is returned

#### Scenario: A NOTAM that becomes effective later is returned

- **WHEN** an airport holds a NOTAM whose effective time is in the future and whose expiry has not passed
- **THEN** that NOTAM is returned, so a client can brief a restriction before it starts

#### Scenario: NOTAMs are ordered newest effective first

- **WHEN** an airport's NOTAMs are returned
- **THEN** they appear ordered by effective time, most recent first

#### Scenario: An airport with no NOTAMs

- **WHEN** a client requests the NOTAMs of an existing airport that has none
- **THEN** the system responds `200 OK` with an empty list

#### Scenario: The airport does not exist

- **WHEN** a client requests the NOTAMs of an airport id that no airport has
- **THEN** the system responds `404 Not Found`

#### Scenario: The airport id is not a valid UUID

- **WHEN** a client requests NOTAMs with an `airportId` that is not a valid UUID v4
- **THEN** the system responds `400 Bad Request`

#### Scenario: Every role may read NOTAMs

- **WHEN** an admin, an operations user, a cabin crew member, or an unauthenticated client requests an airport's NOTAMs
- **THEN** each receives the same `200 OK` response
