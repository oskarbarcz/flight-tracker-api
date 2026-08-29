## ADDED Requirements

### Requirement: A shipment's journey may extend beyond the flight carrying it

The system SHALL record on every shipment an origin airport and a final destination airport
independent of the flight's own departure and arrival, so that the flight may be the whole of a
shipment's journey or only one leg of it.

#### Scenario: A shipment travelling only on this flight

- **WHEN** a shipment whose origin is the flight's departure and whose destination is its arrival is read
- **THEN** it reports the flight's own airports as its origin and destination

#### Scenario: A shipment continuing beyond the arrival

- **WHEN** a shipment whose destination lies beyond the flight's arrival is read
- **THEN** it reports that further destination

#### Scenario: A shipment that started elsewhere

- **WHEN** a shipment whose origin lies before the flight's departure is read
- **THEN** it reports that earlier origin

### Requirement: A shipment reports its role on this flight

The system SHALL classify each shipment by comparing its origin against the flight's departure
and its destination against the flight's arrival, reporting it as carried end to end, raised here
for onward carriage, arriving as a transfer, or passing through on the way somewhere else.

#### Scenario: Cargo carried end to end

- **GIVEN** a shipment whose origin is the flight's departure and whose destination is its arrival
- **WHEN** it is read
- **THEN** it is reported as carried end to end

#### Scenario: Cargo raised here for onward carriage

- **GIVEN** a shipment originating at the flight's departure and destined beyond its arrival
- **WHEN** it is read
- **THEN** it is reported as raised here for onward carriage

#### Scenario: Cargo arriving as a transfer

- **GIVEN** a shipment originating before the flight's departure and destined for its arrival
- **WHEN** it is read
- **THEN** it is reported as an inbound transfer

#### Scenario: Cargo passing through

- **GIVEN** a shipment originating before the flight's departure and destined beyond its arrival
- **WHEN** it is read
- **THEN** it is reported as passing through

### Requirement: A shipment continuing onward names its connection

The system SHALL record for every shipment whose destination lies beyond the flight's arrival the
carrier and flight number it continues on and the time available to make that connection, so that
a tight connection is visible rather than implied.

#### Scenario: An onward connection is reported

- **GIVEN** a shipment continuing beyond the flight's arrival
- **WHEN** it is read
- **THEN** it reports an onward carrier, an onward flight number and a connection time

#### Scenario: A tight connection is distinguished

- **GIVEN** a shipment whose connection time falls below the minimum for a transfer
- **WHEN** the manifest is read
- **THEN** that shipment is reported as being at risk of missing its connection

#### Scenario: Cargo terminating here names no connection

- **GIVEN** a shipment destined for the flight's arrival
- **WHEN** it is read
- **THEN** it reports no onward carrier and no connection time

### Requirement: A shipment's air waybill prefix reflects who raised it

The system SHALL issue the air waybill number of a shipment raised on this flight under the
operating carrier's own prefix, and SHALL issue the number of an inbound transfer under a
different carrier's prefix, so that the number itself shows which cargo the operator raised and
which it inherited.

#### Scenario: Cargo raised here carries the operator's prefix

- **GIVEN** a shipment originating at the flight's departure
- **WHEN** its air waybill number is read
- **THEN** its prefix is the operating carrier's prefix

#### Scenario: An inbound transfer carries another carrier's prefix

- **GIVEN** a shipment originating before the flight's departure
- **WHEN** its air waybill number is read
- **THEN** its prefix is not the operating carrier's prefix

### Requirement: A unit built for a single onward point transfers intact

The system SHALL group shipments into load units by their onward destination before any other
consideration, and SHALL mark a unit whose shipments all continue to the same point beyond the
flight's arrival as transferring intact. A unit holding shipments for more than one destination
SHALL be marked as broken down on arrival.

#### Scenario: A single-destination unit is sealed

- **GIVEN** a load unit whose shipments all continue to the same point beyond the arrival
- **WHEN** it is read
- **THEN** it reports that destination and is marked as transferring intact

#### Scenario: A mixed unit is broken down

- **GIVEN** a load unit holding shipments for more than one destination
- **WHEN** it is read
- **THEN** it is marked as broken down on arrival

#### Scenario: A unit built for a beyond point holds nothing else

- **WHEN** a cargo manifest is generated
- **THEN** no unit marked as transferring intact holds a shipment for any other destination

#### Scenario: Loose load is never sent onward intact

- **WHEN** a cargo manifest carrying loose load is generated
- **THEN** no loose lot is marked as transferring intact
