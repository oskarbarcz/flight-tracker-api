# aircraft-management

## Purpose

Record an operator's aircraft and define the attributes required to create and
represent one — covering which attributes are optional versus required, how
missing attributes are defaulted, and how an aircraft's base airport is set and
changed via `POST`/`PATCH /api/v1/operator/{operatorId}/aircraft`.

## Requirements

### Requirement: Aircraft SELCAL code is optional

The system SHALL treat an aircraft's SELCAL code as an optional attribute. Creating or updating an aircraft SHALL succeed whether the `selcal` field is provided, omitted, or explicitly `null`, and the stored/returned value SHALL be `null` when no SELCAL code is known. When a SELCAL code is provided it SHALL be a string; the system SHALL NOT impose a format constraint on it.

#### Scenario: Create aircraft without a SELCAL code

- **WHEN** an operations user creates an aircraft and omits the `selcal` field
- **THEN** the aircraft is created and its `selcal` is returned as `null`

#### Scenario: Create aircraft with an explicit null SELCAL code

- **WHEN** an operations user creates an aircraft with `selcal` set to `null`
- **THEN** the aircraft is created and its `selcal` is returned as `null`

#### Scenario: Create aircraft with a SELCAL code

- **WHEN** an operations user creates an aircraft with a non-empty `selcal` string
- **THEN** the aircraft is created and the provided `selcal` value is returned

#### Scenario: Missing SELCAL does not fail request validation

- **WHEN** an operations user creates an aircraft with only `type`, `registration`, and `livery`
- **THEN** the request is not rejected on account of a missing `selcal`, and the aircraft is created

### Requirement: Aircraft read models expose a nullable SELCAL code

The system SHALL expose `selcal` as a nullable string wherever an aircraft is represented — when fetching an aircraft by id or registration, when listing an operator's aircraft, and when an aircraft is embedded in a flight response. The API documentation SHALL describe `selcal` as nullable.

#### Scenario: Reading an aircraft that has no SELCAL code

- **WHEN** a client fetches an aircraft whose SELCAL code is not set
- **THEN** the response includes `selcal` with a value of `null`

#### Scenario: Reading an aircraft that has a SELCAL code

- **WHEN** a client fetches an aircraft whose SELCAL code is set
- **THEN** the response includes `selcal` with the stored string value

### Requirement: A created aircraft requires a base airport and starts there

The system SHALL require a `baseAirportId` when an operations user creates an aircraft. The field MUST be present and reference an existing airport: an absent `baseAirportId` is rejected with `400 Bad Request` and an unknown one with `404 Not Found`. On successful creation the aircraft's last known airport SHALL be initialised to its base airport, so the response resolves both `baseAirport` and `lastAirport` to the referenced airport.

#### Scenario: Create aircraft with a base airport

- **WHEN** an operations user creates an aircraft with `baseAirportId` set to an existing airport id
- **THEN** the aircraft is created and the response resolves both `baseAirport` and `lastAirport` to that airport

#### Scenario: Create aircraft without a base airport

- **WHEN** an operations user creates an aircraft and omits `baseAirportId`
- **THEN** the request is rejected with `400 Bad Request` and the aircraft is not created

#### Scenario: Create aircraft with an unknown base airport

- **WHEN** an operations user creates an aircraft with a `baseAirportId` that does not reference an existing airport
- **THEN** the request is rejected with `404 Not Found` and the aircraft is not created

### Requirement: Aircraft livery is optional and defaults to operator and year

The system SHALL treat an aircraft's livery as optional on creation. When `livery` is omitted it SHALL default to `"<operator short name> <current year>"` (e.g. `"Lufthansa 2026"`); when provided it MUST be a non-empty string and is stored verbatim, and an empty `livery` SHALL be rejected with `400 Bad Request`.

#### Scenario: Create aircraft without a livery

- **WHEN** an operations user creates an aircraft and omits `livery`
- **THEN** the aircraft is created with `livery` set to the operator's short name followed by the current year

#### Scenario: Create aircraft with a livery

- **WHEN** an operations user creates an aircraft with a non-empty `livery`
- **THEN** the aircraft is created with the provided `livery` stored verbatim

### Requirement: Operations can change an aircraft's base airport

The system SHALL accept an optional `baseAirportId` when an operations user updates an aircraft. Providing an existing airport id SHALL reassign the base airport; providing `null` SHALL clear it; omitting the field SHALL leave it unchanged. A provided non-null id that does not reference an existing airport SHALL be rejected with `404 Not Found`.

#### Scenario: Change the base airport to another airport

- **WHEN** an operations user updates an aircraft with `baseAirportId` set to a different existing airport id
- **THEN** the aircraft's base airport is reassigned and the response's `baseAirport` resolves to the new airport

#### Scenario: Clear the base airport

- **WHEN** an operations user updates an aircraft with `baseAirportId` set to `null`
- **THEN** the aircraft's base airport is cleared and the response's `baseAirport` is `null`

#### Scenario: Update with an unknown base airport

- **WHEN** an operations user updates an aircraft with a `baseAirportId` that does not reference an existing airport
- **THEN** the request is rejected with `404 Not Found` and the base airport is left unchanged

### Requirement: Aircraft read models expose the assigned cabin layout

The system SHALL report on every aircraft read the cabin layout assigned to that aircraft, or
that none is assigned. Where one is assigned, the read SHALL report the layout identifier, its
airline and aircraft type codes, its variant, the revision currently in force, whether the
layout has been retired upstream, and whether the layout's airline or aircraft type differs
from the aircraft's own.

#### Scenario: An aircraft with an assigned layout

- **WHEN** an authenticated user reads an aircraft that has a cabin layout assigned
- **THEN** the aircraft reports the layout identifier, its airline and aircraft type, its variant and the current revision

#### Scenario: An aircraft without an assigned layout

- **WHEN** an authenticated user reads an aircraft that has no cabin layout assigned
- **THEN** the aircraft reports that no cabin layout is assigned

#### Scenario: A retired layout is reported as retired

- **GIVEN** an aircraft assigned a layout that has since been retired upstream
- **WHEN** the aircraft is read
- **THEN** the assigned layout is reported and marked as retired

#### Scenario: A borrowed layout is reported as mismatched

- **GIVEN** an aircraft assigned a layout belonging to another airline
- **WHEN** the aircraft is read
- **THEN** the assigned layout is reported and marked as mismatched

### Requirement: Cabin layout assignment is not part of creating or editing an aircraft

The system SHALL NOT accept a cabin layout on the requests that create or edit an aircraft.
Assignment SHALL be made only through the dedicated assignment request, so that the aircraft
write model stays independent of the layout catalogue.

#### Scenario: Creating an aircraft ignores a cabin layout

- **WHEN** operations creates an aircraft
- **THEN** the created aircraft has no cabin layout assigned

#### Scenario: Editing an aircraft cannot set a cabin layout

- **WHEN** operations edits an aircraft
- **THEN** the aircraft's assigned cabin layout is unchanged
