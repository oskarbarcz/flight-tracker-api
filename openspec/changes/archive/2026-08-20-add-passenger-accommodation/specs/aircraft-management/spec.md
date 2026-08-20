## ADDED Requirements

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
