## Purpose

Records which countries a pilot has entered and when, one stamp per arrival, so that a pilot's
travel can be shown the way a passport shows it: the countries collected, the date each was first
unlocked, and every individual entry since.

## ADDED Requirements

### Requirement: An arrival stamps the country the pilot landed in

The system SHALL record a stamp when a pilot's flight reports on-block, naming the country of the
airport the aircraft landed at, the flight, the airport, and the moment the flight completed. Only
the country landed in SHALL be stamped: departing a country is not an entry, so a flight SHALL
produce exactly one stamp regardless of how many airports it names.

#### Scenario: An international arrival is stamped

- **WHEN** a pilot completes a flight from an airport in Germany to an airport in France
- **THEN** one stamp is recorded for `FR`, and none for `DE`

#### Scenario: A domestic arrival is stamped once

- **WHEN** a pilot completes a flight between two airports in Germany
- **THEN** exactly one stamp is recorded for `DE`

#### Scenario: A stamp carries where and when

- **WHEN** a pilot completes a flight
- **THEN** the stamp records the country, the flight, the airport landed at, and the flight's completion time

### Requirement: A diverted flight stamps where the aircraft landed

The system SHALL stamp the country of the airport the aircraft actually landed at, so that a flight
diverted to another country records an entry to that country and not to the one it was planned to
reach.

#### Scenario: A diversion abroad stamps the diversion country

- **GIVEN** a flight planned from Germany to France that diverts to an airport in Belgium
- **WHEN** the flight reports on-block
- **THEN** one stamp is recorded for `BE`, and none for `FR`

#### Scenario: A diversion within the planned country stamps once

- **GIVEN** a flight planned from Germany to France that diverts to another airport in France
- **WHEN** the flight reports on-block
- **THEN** exactly one stamp is recorded for `FR`

### Requirement: A flight stamps a pilot's passport at most once

The system SHALL record at most one stamp per pilot per flight, so that a completion event delivered
more than once, or a flight that reports on-block and is later closed, does not stamp the passport
twice. The system SHALL attribute the stamp to the flight's captain, since that is the pilot who
flew it; a flight with no captain SHALL record no stamp.

#### Scenario: A repeated completion event does not double-stamp

- **GIVEN** a completed flight that has already stamped its captain's passport
- **WHEN** the completion is processed again
- **THEN** the passport still holds one stamp for that flight

#### Scenario: The captain is stamped, not the dispatcher

- **GIVEN** a flight created by an operations user and flown by a cabin crew captain
- **WHEN** the flight completes
- **THEN** the captain's passport is stamped and the operations user's is not

#### Scenario: An uncrewed flight stamps nobody

- **WHEN** a flight with no captain completes
- **THEN** no stamp is recorded

### Requirement: A pilot's passport reports every country entered

The system SHALL expose the pilot's own passport: one entry per country entered, reporting the
country code, its catalogue name and flag, the number of visits, the first visit and the most recent
visit. Entries SHALL be ordered by first visit, oldest first, so the passport reads in the order the
countries were unlocked. A pilot who has entered no country SHALL receive an empty passport rather
than an error.

#### Scenario: A visited country is reported with its counts

- **GIVEN** a pilot who has landed in Germany three times
- **WHEN** they read their passport
- **THEN** `DE` is reported with three visits, the date of the first and the date of the most recent

#### Scenario: The passport reads in unlock order

- **GIVEN** a pilot who first landed in France, then in Germany
- **WHEN** they read their passport
- **THEN** `FR` is listed before `DE`

#### Scenario: A country never entered is absent

- **GIVEN** a pilot who has never landed in Canada
- **WHEN** they read their passport
- **THEN** `CA` does not appear

#### Scenario: A pilot who has never flown has an empty passport

- **WHEN** a pilot with no completed flights reads their passport
- **THEN** the passport is empty and the request succeeds

### Requirement: A country's individual stamps can be read

The system SHALL expose the individual stamps the pilot holds for one country, each reporting the
airport landed at, the flight and the moment, ordered most recent first. The system SHALL accept the
country code in any letter case, SHALL reject a code the catalogue does not recognise as a validation
error, and SHALL report a recognised country the pilot has never entered as not found.

#### Scenario: Every entry to a country is listed

- **GIVEN** a pilot who has landed in Germany three times
- **WHEN** they read their stamps for `DE`
- **THEN** three stamps are listed, each naming its airport, flight and moment, most recent first

#### Scenario: Letter case does not matter

- **WHEN** a pilot reads their stamps for `de`
- **THEN** the stamps for `DE` are returned

#### Scenario: A country never entered is not found

- **GIVEN** a pilot who has never landed in Canada
- **WHEN** they read their stamps for `CA`
- **THEN** the request is rejected as not found

#### Scenario: An unrecognised code is rejected

- **WHEN** a pilot reads their stamps for `QQ`, which the catalogue does not recognise
- **THEN** the request is rejected with a validation error

### Requirement: A passport belongs to the pilot who reads it

The system SHALL scope every passport read to the authenticated caller, so that a caller reads their
own passport and never another pilot's, and SHALL reject an unauthenticated read as unauthorized.
Any authenticated role SHALL be able to read its own passport.

#### Scenario: A pilot reads their own passport

- **WHEN** an authenticated pilot reads the passport
- **THEN** the response holds their own stamps and no other pilot's

#### Scenario: Cabin crew may read their passport

- **WHEN** a cabin crew user reads their passport
- **THEN** the request succeeds

#### Scenario: An unauthenticated caller cannot read a passport

- **WHEN** a request for the passport carries no access token
- **THEN** the request is rejected as unauthorized

### Requirement: Stamps are backfilled from flights already completed

The system SHALL record stamps for flights completed before this capability existed, deriving each
from the flight's captain, its completion time and the airport it landed at — the diversion airport
where the flight diverted — so that a pilot's passport reflects their whole history rather than
starting empty. The backfill SHALL produce the same stamps a live arrival would have produced, and
SHALL leave a passport unchanged if run again.

#### Scenario: History appears in the passport

- **GIVEN** a pilot whose completed flights landed in Germany and France before this capability existed
- **WHEN** they read their passport
- **THEN** `DE` and `FR` are both stamped, dated by when those flights completed

#### Scenario: A historical diversion is stamped where it landed

- **GIVEN** a completed flight that diverted to an airport in another country
- **WHEN** the passport is backfilled
- **THEN** the stamp names the country the flight diverted to

#### Scenario: Backfilling twice changes nothing

- **WHEN** the backfill runs a second time
- **THEN** the passport holds the same stamps, with no duplicates
