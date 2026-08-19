# airframe-service-type Specification

## Purpose

Records the service each airframe is built for — passengers, freight, or either — so that
a client can tell a freighter from a passenger type without keeping its own list of ICAO
designators. The classification is descriptive reference data: nothing else in the system
is derived from it.

## Requirements

### Requirement: Every airframe declares the service it is built for

The system SHALL classify every airframe it knows as `passenger`, `cargo`, or `both`, and SHALL accept no other value. The classification SHALL be present on every airframe in the reference dataset, so that no airframe can be read without it.

#### Scenario: Reading a passenger airframe

- **WHEN** an authenticated user reads an airframe built for passengers
- **THEN** its service type is reported as `passenger`

#### Scenario: Reading a freighter airframe

- **WHEN** an authenticated user reads an airframe that exists only as a freighter, such as `B77F`
- **THEN** its service type is reported as `cargo`

#### Scenario: Reading a dual-role airframe

- **WHEN** an authenticated user reads a utility airframe delivered for either role, such as `C208`
- **THEN** its service type is reported as `both`

#### Scenario: No airframe is left unclassified

- **WHEN** the airframe reference dataset is loaded
- **THEN** every airframe in it declares one of the three accepted values

### Requirement: The classification follows the airframe's factory role

The system SHALL classify an airframe from the factory role of the variants its ICAO type designator covers. A designator that exists only as a freighter SHALL be `cargo`. A designator delivered from the factory for either passengers or freight SHALL be `both`. Every other designator SHALL be `passenger`. Aftermarket freighter conversions SHALL NOT affect the classification, since almost any airliner has been converted by somebody and counting conversions would classify nearly every airframe as `both`.

#### Scenario: A jetliner with a separate freighter designator

- **WHEN** a jetliner's passenger and freighter variants carry different type designators, as `B772` and `B77F` do
- **THEN** the passenger designator is `passenger` and the freighter designator is `cargo`

#### Scenario: A passenger jetliner with aftermarket freighters in service

- **WHEN** a passenger airframe has aftermarket freighter conversions flying, as `B738` does
- **THEN** it is still classified as `passenger`

### Requirement: The service type is exposed in every airframe read

The system SHALL include the service type in every response carrying an airframe body, using the field name `serviceType`. This covers the airframe list, the single airframe read, and every response that embeds a resolved airframe.

#### Scenario: Single airframe read

- **WHEN** an authenticated user requests `GET /api/v1/airframe/{type}`
- **THEN** the response body includes `serviceType`

#### Scenario: Airframe list

- **WHEN** an authenticated user requests `GET /api/v1/airframe`
- **THEN** every airframe in the returned list includes `serviceType`

#### Scenario: Embedded airframe body

- **WHEN** a response embeds a resolved airframe — an aircraft read, a flight body, or a user's aircraft history
- **THEN** the embedded airframe includes `serviceType`

### Requirement: The classification carries no behavioural consequence

The system SHALL NOT derive a flight's or an operator's service type from an airframe's, and SHALL NOT reject a combination of the three. An operator classified `passenger` MAY own a `cargo` airframe, and a flight classified `cargo` MAY be operated by a `passenger` airframe, because a leg's payload is a dispatch decision rather than a property of the metal.

#### Scenario: A cargo flight on a passenger airframe

- **WHEN** a flight classified as `cargo` is created for an aircraft whose airframe is `passenger`
- **THEN** the flight is created and neither classification is changed

#### Scenario: A freighter in a passenger operator's fleet

- **WHEN** an aircraft whose airframe is `cargo` is added to an operator classified as `passenger`
- **THEN** the aircraft is created and neither classification is changed
