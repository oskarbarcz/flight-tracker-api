# flight-service-type Specification

## Purpose

Records whether a flight operates as a passenger service or a cargo service, so that clients can label and filter freight operations. The classification is descriptive metadata only — no backend behaviour is derived from it.

## Requirements

### Requirement: Flight service type classification

The system SHALL classify every flight as either a `passenger` service or a `cargo` service, and SHALL treat `passenger` as the value for any flight whose service type was never specified. No other values are accepted.

The classification MUST NOT influence any other backend behaviour: loadsheet validation, crew assignment rules, timesheets, delay handling, statistics accrual, and lifecycle transitions behave identically for both values.

#### Scenario: Flight created without a service type

- **WHEN** a flight is created and no service type is supplied
- **THEN** the flight is classified as `passenger`

#### Scenario: Flight created as a cargo service

- **WHEN** a flight is created with service type `cargo`
- **THEN** the flight is classified as `cargo`

#### Scenario: Flight created with an unsupported service type

- **WHEN** a flight is created with a service type other than `passenger` or `cargo`
- **THEN** the request is rejected with status `400` and a validation violation naming the service type field and the accepted values
- **AND** no flight is created

#### Scenario: Existing flights predate the classification

- **WHEN** flights that were created before this capability existed are read
- **THEN** each is reported as a `passenger` service

#### Scenario: Cargo classification carries no behavioural consequence

- **WHEN** a flight classified as `cargo` is taken through its lifecycle — marked ready, checked in, boarded, dispatched, and closed
- **THEN** every transition, validation, and side effect is identical to those of an otherwise-equal `passenger` flight

### Requirement: Service type is exposed in flight read models

The system SHALL include the service type in every response that carries a flight body, using the field name `serviceType` with the literal value `passenger` or `cargo`.

#### Scenario: Reading a single flight

- **WHEN** an authenticated user requests `GET /api/v1/flight/{id}`
- **THEN** the response body includes `serviceType` with the flight's current classification

#### Scenario: Listing flights

- **WHEN** an authenticated user requests `GET /api/v1/flight`
- **THEN** every flight in the returned list includes `serviceType`

#### Scenario: Responses returned by flight-mutating endpoints

- **WHEN** an endpoint that returns a flight body responds — flight creation, SimBrief import, or a runway/parking-position update
- **THEN** the returned flight body includes `serviceType`

### Requirement: Service type is derived from an imported SimBrief flight plan

The system SHALL derive the service type when a flight is created from a SimBrief operational flight plan, because SimBrief exposes no explicit cargo or freighter indicator. A plan reporting zero passengers SHALL yield `cargo`; any other passenger count SHALL yield `passenger`. When the plan omits the passenger count, the flight SHALL be classified as `passenger`.

The derivation is a heuristic and is not authoritative — operations correct it through the service type mutation while the flight is still editable.

#### Scenario: Imported plan reports no passengers

- **WHEN** a flight is imported from a SimBrief flight plan whose passenger count is zero
- **THEN** the created flight is classified as `cargo`

#### Scenario: Imported plan reports passengers

- **WHEN** a flight is imported from a SimBrief flight plan whose passenger count is greater than zero
- **THEN** the created flight is classified as `passenger`

#### Scenario: Imported plan omits the passenger count

- **WHEN** a flight is imported from a SimBrief flight plan that carries no passenger count
- **THEN** the created flight is classified as `passenger`

#### Scenario: Operations override a wrong derivation

- **WHEN** a flight imported from SimBrief was derived as `cargo` but actually operates as a passenger service, and operations change its service type to `passenger`
- **THEN** the flight is classified as `passenger`

### Requirement: Operations change a flight's service type before it is marked ready

The system SHALL expose `PATCH /api/v1/flight/{id}` for updating flight attributes, accepting a partial body whose only currently supported field is `serviceType`, and SHALL answer `204` with no body on success. The change is only permitted while the flight is still in `created` status; once operations have marked the flight as ready, the service type is frozen and the request SHALL be rejected with status `422`.

A body carrying no supported field SHALL be accepted as a no-op and answer `204`.

#### Scenario: Operations change the service type of a flight in created status

- **WHEN** a user with the `operations` role sends `PATCH /api/v1/flight/{id}` with `serviceType` set to `cargo` for a flight in `created` status
- **THEN** the response status is `204`
- **AND** subsequently reading the flight reports `serviceType` as `cargo`

#### Scenario: Service type is frozen once the flight is ready

- **WHEN** a user with the `operations` role sends `PATCH /api/v1/flight/{id}` with `serviceType` set to `cargo` for a flight whose status has advanced past `created`
- **THEN** the response status is `422` with a message stating the service type can only be changed before the flight is marked as ready
- **AND** the flight's service type is unchanged

#### Scenario: Unsupported service type value

- **WHEN** a user with the `operations` role sends `PATCH /api/v1/flight/{id}` with a `serviceType` that is neither `passenger` nor `cargo`
- **THEN** the response status is `400` with a violation naming `serviceType` and listing the accepted values
- **AND** the flight's service type is unchanged

#### Scenario: Empty patch body

- **WHEN** a user with the `operations` role sends `PATCH /api/v1/flight/{id}` with an empty body for a flight in `created` status
- **THEN** the response status is `204`
- **AND** the flight is unchanged

#### Scenario: Flight does not exist

- **WHEN** a user with the `operations` role sends `PATCH /api/v1/flight/{id}` for an identifier that matches no flight
- **THEN** the response status is `404`

#### Scenario: Malformed flight identifier

- **WHEN** a user with the `operations` role sends `PATCH /api/v1/flight/{id}` with an identifier that is not a v4 UUID
- **THEN** the response status is `400`

### Requirement: Changing a service type is restricted to the operations role

The system SHALL restrict `PATCH /api/v1/flight/{id}` to users holding the `operations` role. Every other authenticated role — including `admin` — SHALL be rejected with `403`, and unauthenticated callers SHALL be rejected with `401`. Reading a flight's service type requires only authentication, matching the existing flight read endpoints.

#### Scenario: Admin is rejected

- **WHEN** a user with the `admin` role sends `PATCH /api/v1/flight/{id}` with a `serviceType`
- **THEN** the response status is `403`
- **AND** the flight's service type is unchanged

#### Scenario: Cabin crew is rejected

- **WHEN** a user with the `cabin crew` role sends `PATCH /api/v1/flight/{id}` with a `serviceType`
- **THEN** the response status is `403`
- **AND** the flight's service type is unchanged

#### Scenario: Unauthenticated caller is rejected

- **WHEN** an unauthenticated caller sends `PATCH /api/v1/flight/{id}` with a `serviceType`
- **THEN** the response status is `401`
- **AND** the flight's service type is unchanged

#### Scenario: Any authenticated role can read the service type

- **WHEN** a user with the `admin`, `operations`, or `cabin crew` role requests `GET /api/v1/flight/{id}`
- **THEN** the response status is `200` and the body includes `serviceType`
