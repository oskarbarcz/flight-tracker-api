## Why

Pilots in the app get no technical context about the aircraft they are assigned:
whether it is serviceable, whether it is ETOPS-ready, what defects were found on
earlier sectors, or how much the airframe has flown. Real pilots see all of this in
their EFB. This change introduces an **aircraft technical logbook** so pilots can
report defects and read an aircraft's technical state, and operations can triage those
defects — giving the app an authentic, EFB-like depth. It is intentionally
**informational only for now**: nothing blocks dispatch yet.

## What Changes

- **ETOPS capability on the aircraft.** New single nullable `etopsThresholdMinutes`
  (∈ `{60,75,90,120,180}`, `NULL` = not certified), editable by operations via the
  existing edit-aircraft endpoint and surfaced on aircraft reads.
- **Automatic utilization ledger (TTSN).** New per-aircraft 1:1 operation-details
  record accruing airborne minutes, block minutes, and cycles from flight completion.
  Aircraft start zeroed. TTSO anchors are reserved in the schema but the overhaul-reset
  action is **deferred** (far future).
- **Pilot defect reporting.** Pilots file defects against a curated ATA-chapter
  taxonomy (category → sub-chapter, each category including an `OTHER` value) with a
  free-text description. Reporting is restricted to pilots who have flown the aircraft.
- **Operations defect triage.** Operations can _confirm_ (attaching a classification),
  _reject_, or _resolve_ a defect. Classification choices are **derived dynamically**
  from the aircraft's certified ETOPS threshold (limit-to-N / no-ETOPS / ground /
  info). Purely informational — no dispatch enforcement.
- **Derived technical status + logbook view.** A read view computes serviceability and
  an effective ETOPS threshold (most-restrictive open defect wins) and a chronological
  feed uniting defects, repositions, and completed sectors.
- **Structured flight fuel breakdown + actual burn.** The loadsheet gains a nested `fuel`
  breakdown (block / taxi / trip / alternate / contingency type+amount / reserve / MEL /
  ATC / WXX / extra / tankering, in tons), with `blockFuel` kept as the summary figure,
  auto-imported from SimBrief and enterable at planning. Optional actual fuel burned is
  captured at flight close for a planned-vs-actual delta.
- **ATA reference data** seeded as a curated grouped list, mirroring the airframes
  reference pattern.

No breaking changes: all additions. The `user-aircraft` capability is _read_ by the
defect-report guard but its requirements are unchanged.

## Capabilities

### New Capabilities

- `ata-chapter-reference`: curated, grouped ATA-chapter taxonomy (category →
  sub-chapter, with `OTHER`) exposed as reference data.
- `aircraft-etops-capability`: the ETOPS certification threshold attribute on an
  aircraft and how it is edited and read.
- `aircraft-utilization`: the automatic TTSN/TTSO utilization ledger (hours + cycles)
  accrued from flight completion.
- `aircraft-defect-log`: pilot defect reporting and the operations triage lifecycle,
  including dynamic ETOPS classification.
- `aircraft-technical-status`: the derived serviceable / ETOPS-ready status and the
  chronological logbook feed.
- `flight-fuel-planning`: the structured planned fuel breakdown and the actual-fuel
  close-out.

### Modified Capabilities

- _None._ All changes are additive.

## Impact

- **`operators` module:** new `aircraft/logbook/` sub-namespace (command / query /
  model / infra-http); new repositories for operation-details and defects; a new
  listener on `OnBlockWasReportedEvent`; extended edit-aircraft DTO; enriched aircraft
  read response.
- **`flights` module:** nested `fuel` breakdown in the loadsheet DTOs; SimBrief import
  populates `loadsheets.preliminary.fuel`; `close-flight` gains an optional
  `actualFuelBurned`.
- **Prisma schema:** `Aircraft.etopsThresholdMinutes`; new tables
  `aircraft_operation_details` and `aircraft_defect`; new enums `AircraftDefectStatus`,
  `AircraftDefectClassification`; `Flight.actualFuelBurned` (the fuel breakdown nests in
  the existing `loadsheets` Json — no new column).
  Migrations + seed backfill (zeroed operation-details rows for existing aircraft).
  Client emits to `prisma/client/` — imports remain `from 'prisma/client/client'`.
- **Reference data:** new `src/modules/.../data/ata-chapters.json` (+ helper + query),
  mirroring `airframes.json`.
- **Functional tests:** new `features/aircraft/` Gherkin, seed-fixture driven.
