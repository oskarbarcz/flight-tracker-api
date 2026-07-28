## ADDED Requirements

### Requirement: Persist per-flight completion facts on the flight

The system SHALL persist, when a flight reports on-block, that flight's actual airborne
minutes (actual takeoff → actual arrival), actual block minutes (actual off-block → actual
on-block), and a `completedAt` timestamp (the actual on-block time) as indexed columns on
the flight, so statistics can be aggregated in SQL without parsing the `timesheet` JSON. A
missing actual timestamp SHALL leave only the affected duration null and SHALL NOT fail the
completion.

#### Scenario: On-block persists completion facts

- **WHEN** a flight reports on-block with actual off-block, takeoff, arrival, and on-block times
- **THEN** the flight records its actual airborne minutes, actual block minutes, and `completedAt`

#### Scenario: A missing timestamp nulls only the affected duration

- **WHEN** a flight reports on-block but has no actual takeoff time
- **THEN** its actual airborne minutes are null
- **AND** its actual block minutes and `completedAt` are still recorded

#### Scenario: completedAt reflects when it flew, not when the record was created

- **WHEN** a flight created earlier reports on-block today
- **THEN** its `completedAt` equals the actual on-block time, not the flight's creation time

### Requirement: Attribute statistics to the operating pilot only

The system SHALL attribute a completed flight's statistics to the flight's captain
(`Flight.captainId`) only. A flight without a captain SHALL NOT contribute to any pilot's
statistics, and deadhead travel SHALL NOT be counted.

#### Scenario: A captained flight contributes to its captain

- **WHEN** a completed flight has a captain
- **THEN** that flight's distance and durations contribute to the captain's statistics

#### Scenario: An uncaptained flight contributes to no one

- **WHEN** a completed flight has no captain
- **THEN** it contributes to no pilot's statistics

### Requirement: Recompute projections from source idempotently

The system SHALL, on each flight-completion event, recompute the affected statistics
projections for the flight's captain from the underlying flights and overwrite the stored
values, rather than incrementing them. Re-delivery of the same completion signal SHALL
leave every projection unchanged, and the projections SHALL always equal an aggregation of
the captain's completed flights.

#### Scenario: Completing a flight updates the captain's projections

- **WHEN** a captain's flight reports on-block
- **THEN** the captain's lifetime, per-type, per-airport, and daily projections reflect that flight

#### Scenario: A duplicate completion does not double-count

- **WHEN** an already-accrued flight's on-block completion is received again
- **THEN** the captain's projections are unchanged

#### Scenario: Closing or editing a completed flight re-derives consistent projections

- **WHEN** a completed flight is closed or its completion facts change
- **THEN** the affected projections are recomputed from source and remain equal to the aggregation of the captain's completed flights

### Requirement: Backfill historical flights

The system SHALL backfill the completion-fact columns for existing completed flights and
recompute every pilot's projections once, so statistics reflect all prior activity without
replaying historical events. The backfill SHALL be idempotent.

#### Scenario: Existing flights populate statistics after backfill

- **WHEN** the backfill runs against pilots who completed flights before this change
- **THEN** each pilot's projections reflect their historical completed flights

#### Scenario: Backfill is idempotent

- **WHEN** the backfill runs a second time
- **THEN** every pilot's totals are unchanged

### Requirement: Emit a stats-changed event

The system SHALL emit a `stats-changed` domain event identifying the affected user whenever
that user's statistics projections change, so future consumers (e.g. achievements) can
react. No consumer is required by this change.

#### Scenario: Recompute emits stats-changed for the affected user

- **WHEN** a pilot's projections are recomputed after a flight completes
- **THEN** a `stats-changed` event carrying that pilot's id is emitted
