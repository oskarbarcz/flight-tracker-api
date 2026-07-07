## ADDED Requirements

### Requirement: Per-aircraft utilization ledger

The system SHALL maintain, one-to-one with each aircraft, a utilization ledger recording
total airborne minutes, total block minutes, and total cycles. New aircraft SHALL start
zeroed; the ledger counts in-app activity only and SHALL NOT import real-world history.

#### Scenario: A new aircraft starts zeroed

- **WHEN** an aircraft is created
- **THEN** its utilization ledger reports zero flight minutes, zero block minutes, and zero cycles

#### Scenario: Every aircraft has exactly one ledger

- **WHEN** the utilization ledger is introduced against existing aircraft
- **THEN** exactly one ledger row exists per aircraft, zeroed

### Requirement: Accrue utilization from completed sectors

The system SHALL, when a flight reports on-block, accrue that sector into the aircraft's
ledger: airborne minutes from actual takeoff to actual arrival, block minutes from actual
off-block to actual on-block, and one cycle. Accrual SHALL be resilient to a missing
timestamp (skip only the affected component) and SHALL NOT double-count if the completion
signal is received more than once for the same flight.

#### Scenario: Completing a sector increments the ledger

- **WHEN** a flight reports on-block with actual off-block, takeoff, arrival, and on-block times
- **THEN** the aircraft's total flight minutes increase by the airborne duration
- **AND** its total block minutes increase by the block duration
- **AND** its total cycles increase by one

#### Scenario: Multiple sectors accumulate

- **WHEN** an aircraft completes several sectors
- **THEN** its ledger reflects the sum of all sectors' minutes and one cycle per sector

#### Scenario: A diverted sector still counts a cycle

- **WHEN** a flight lands at a diversion airport and reports on-block
- **THEN** the sector is accrued and one cycle is added

#### Scenario: The same completion is not counted twice

- **WHEN** an already-accrued flight's on-block completion is received again
- **THEN** the ledger totals are unchanged

### Requirement: Expose TTSN and derive TTSO

The system SHALL expose Total Time Since New (TTSN) as the accrued flight minutes, block
minutes, and cycles, and SHALL derive Total Time Since Overhaul (TTSO) as the totals
minus the last-overhaul anchors. Until an overhaul is ever recorded, the anchors are zero
and TTSO equals TTSN.

#### Scenario: TTSO equals TTSN before any overhaul

- **WHEN** an aircraft has never had an overhaul recorded
- **THEN** its TTSO equals its TTSN for minutes and cycles
