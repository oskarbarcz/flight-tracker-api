## ADDED Requirements

### Requirement: Pilots report aircraft defects

The system SHALL allow an authenticated pilot to report a defect against an aircraft,
supplying an ATA category, an ATA sub-chapter, and a free-text description. A reported
defect SHALL be visible immediately (from the `reported` status) and SHALL record the
reporting user and the time it was reported. The system SHALL associate the defect with
the flight the reporter most recently flew on that aircraft when a flight is not supplied
explicitly.

#### Scenario: Pilot files a defect

- **WHEN** a pilot who has flown the aircraft posts a defect with category, sub-chapter, and description
- **THEN** a defect is created with status `reported`
- **AND** it records the reporting user and report time
- **AND** it is immediately visible in the aircraft's defect list

#### Scenario: Category and sub-chapter are required

- **WHEN** a defect is posted without a category or without a sub-chapter
- **THEN** the system rejects the request with a validation error

### Requirement: Restrict reporting to pilots who have flown the aircraft

The system SHALL permit a defect report only when the reporting user has a
`user_aircraft` record for that aircraft (i.e. has flown it). Otherwise the system SHALL
reject the report.

#### Scenario: Pilot has flown the aircraft

- **WHEN** a user with a `user_aircraft` record for the aircraft reports a defect
- **THEN** the report is accepted

#### Scenario: Pilot has never flown the aircraft

- **WHEN** a user without any `user_aircraft` record for the aircraft attempts to report a defect
- **THEN** the system rejects the request with 403 Forbidden

### Requirement: Defect lifecycle and operations triage

The system SHALL let operations transition a defect through a fixed lifecycle:
`reported → confirmed`, `reported → rejected` (terminal), and `confirmed → resolved`.
Confirming, rejecting, and resolving SHALL be restricted to the operations role and SHALL
record the acting user and timestamp. Resolving SHALL accept a resolution note. Resolved
and rejected defects SHALL be retained and remain readable as history. Transitions that
are not permitted from the current status SHALL be rejected.

#### Scenario: Operations confirms a reported defect

- **WHEN** operations confirms a `reported` defect
- **THEN** its status becomes `confirmed`
- **AND** the confirming user and time are recorded

#### Scenario: Operations rejects a reported defect

- **WHEN** operations rejects a `reported` defect
- **THEN** its status becomes `rejected`
- **AND** the defect remains readable in history

#### Scenario: Operations resolves a confirmed defect

- **WHEN** operations resolves a `confirmed` defect with a resolution note
- **THEN** its status becomes `resolved`
- **AND** the resolution note, resolving user, and time are recorded

#### Scenario: Cannot resolve a defect that was never confirmed

- **WHEN** operations attempts to resolve a `reported` defect
- **THEN** the system rejects the transition

#### Scenario: Triage requires the operations role

- **WHEN** a non-operations user attempts to confirm, reject, or resolve a defect
- **THEN** the system responds with 403 Forbidden

### Requirement: Classification is derived from the aircraft's ETOPS threshold

The system SHALL, at confirmation, require operations to choose a classification from a
set derived from the aircraft's certified ETOPS threshold `T`: `info`; `etops_limit` to
any ladder value strictly less than `T` (from `60/75/90/120/180`) captured in
`etopsLimitMinutes`; `etops_prohibited`; or `grounded`. When the aircraft is not
ETOPS-certified, only `info` and `grounded` SHALL be offered. Submitting a classification
outside the derived set — including an `etops_limit` value not below `T` — SHALL be
rejected. Classification is informational only and SHALL NOT block any operation.

#### Scenario: Limit choices reflect the certified threshold

- **WHEN** operations requests classification options for an aircraft certified to 90 minutes
- **THEN** the options include `limit to 75`, `limit to 60`, `no ETOPS`, `ground`, and `info`

#### Scenario: Confirm with an ETOPS limit

- **WHEN** operations confirms a defect on a 90-minute aircraft with `etops_limit` of 60
- **THEN** the defect stores classification `etops_limit` with `etopsLimitMinutes` 60

#### Scenario: Reject a limit not below the threshold

- **WHEN** operations confirms a defect on a 90-minute aircraft with `etops_limit` of 120
- **THEN** the system rejects the request

#### Scenario: Non-certified aircraft offer only info and ground

- **WHEN** operations requests classification options for a non-ETOPS aircraft
- **THEN** the options are limited to `info` and `ground`

### Requirement: Read defects with open items first

The system SHALL expose an aircraft's defects, presenting open defects (`reported` and
`confirmed`) ahead of history (`rejected` and `resolved`), and SHALL expose a single
defect by id. History SHALL remain visible but not on first glance.

#### Scenario: Listing separates open from history

- **WHEN** a user lists an aircraft's defects
- **THEN** open defects appear ahead of resolved and rejected ones

#### Scenario: Retrieve a single defect

- **WHEN** a user requests a defect by id
- **THEN** the response contains that defect's full detail including its status and classification
