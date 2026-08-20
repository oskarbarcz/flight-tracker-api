# manifest-reconciliation

## Purpose

Bring a flight's manifest into line with the final loadsheet when boarding finishes:
surplus passengers become no-shows keeping their seat, shortfalls are seated in free ones,
and everybody else is left untouched. Covers per-cabin reconciliation, the retained
no-shows and the status filter that lists them.

## Requirements

### Requirement: Finishing boarding reconciles the manifest against the final loadsheet

The system SHALL reconcile a flight's manifest when boarding is finished, comparing the final
loadsheet's passenger count against the manifest generated at release. Where the final count
is lower, the surplus SHALL be recorded as no-shows; where it is higher, the shortfall SHALL
be filled with newly generated passengers seated in free seats.

#### Scenario: A lower final count produces no-shows

- **GIVEN** a released flight whose manifest holds more passengers than its final loadsheet reports
- **WHEN** boarding is finished
- **THEN** the surplus passengers are recorded as no-shows
- **AND** the number of boarded passengers equals the final loadsheet's count

#### Scenario: A higher final count adds passengers

- **GIVEN** a released flight whose manifest holds fewer passengers than its final loadsheet reports
- **WHEN** boarding is finished
- **THEN** new passengers are generated into free seats
- **AND** the number of boarded passengers equals the final loadsheet's count

#### Scenario: An unchanged count changes nothing

- **GIVEN** a released flight whose final loadsheet reports the same count as its manifest
- **WHEN** boarding is finished
- **THEN** no passenger is added and none becomes a no-show

### Requirement: Reconciliation preserves the passengers who remain

The system SHALL leave the name, seat and booking reference of every passenger who is neither
added nor recorded as a no-show exactly as they were, so that reconciliation is a change to
the edges of a manifest and never a regeneration of it.

#### Scenario: Remaining passengers are untouched

- **GIVEN** a released flight with a generated manifest
- **WHEN** boarding is finished with a different passenger count
- **THEN** every passenger who is neither added nor made a no-show keeps the same seat, name and booking reference

### Requirement: Reconciliation is applied per cabin class

The system SHALL reconcile each cabin class independently against the final loadsheet's
breakdown for that class where one is given, so that a shift between classes both removes
from one and adds to the other. Where the final loadsheet gives only a total, the total SHALL
be distributed across cabins in proportion to their size and reconciled per class against that
distribution.

#### Scenario: A shift between classes reconciles both

- **GIVEN** a released flight whose final loadsheet reports fewer business and more economy passengers than the manifest holds
- **WHEN** boarding is finished
- **THEN** business passengers are recorded as no-shows
- **AND** economy passengers are added

#### Scenario: A total-only loadsheet reconciles proportionally

- **GIVEN** a final loadsheet reporting only a total passenger count
- **WHEN** boarding is finished
- **THEN** each cabin's boarded count matches its proportional share of that total

### Requirement: No-shows are retained and readable

The system SHALL keep a no-show passenger on the manifest, recording the seat they were
assigned, and SHALL NOT delete them. The manifest SHALL be filterable by passenger status so
that boarded passengers and no-shows can each be listed, and a passenger's status SHALL be one
of boarded or no-show.

#### Scenario: No-shows are listed separately

- **GIVEN** a flight whose boarding produced no-shows
- **WHEN** the manifest is read filtered to no-shows
- **THEN** only the no-show passengers are returned, each with the seat they were assigned

#### Scenario: Boarded passengers are listed separately

- **WHEN** the manifest is read filtered to boarded passengers
- **THEN** no no-show passenger is returned

#### Scenario: The unfiltered manifest holds both

- **WHEN** the manifest is read without a status filter
- **THEN** both boarded passengers and no-shows are returned, each reporting its status

#### Scenario: A no-show's seat is not reused

- **GIVEN** a flight whose boarding recorded a no-show in a given seat
- **WHEN** the manifest is read
- **THEN** no boarded passenger occupies that seat

### Requirement: A final passenger count exceeding seat capacity is rejected

The system SHALL reject as unprocessable an attempt to finish boarding when the final
loadsheet reports more passengers than the flight's pinned layout revision has seats. The
check SHALL apply only when the flight has a pinned layout revision.

#### Scenario: An over-capacity final loadsheet blocks boarding completion

- **GIVEN** a released flight pinned to a layout revision
- **WHEN** boarding is finished with a final loadsheet reporting more passengers than there are seats
- **THEN** the request is rejected as unprocessable
- **AND** boarding is not finished

#### Scenario: A flight without a layout skips the check

- **GIVEN** a released flight whose aircraft has no assigned cabin layout
- **WHEN** boarding is finished with any passenger count
- **THEN** the request succeeds and no manifest is reconciled
