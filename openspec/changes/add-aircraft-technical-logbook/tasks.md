<!--
Each group is an independent, individually shippable unit (one GitHub issue). There is
no shared "foundations" group: every group carries its own schema/migration/client-regen
work. Dependencies between groups are noted in each heading. Group 8 is the
Definition-of-Done applied inside every group, not a separate issue.
-->

## 1. ATA reference data (independent) — capability `ata-chapter-reference`

- [ ] 1.1 Author `data/ata-chapters.json` (grouped categories → sub-chapters, each with `OTHER`) + `ata.ts` helper (`findAtaCategory`, `isValidSubchapter`)
- [ ] 1.2 Add a list query + `GET /api/v1/ata-chapters` controller (mirror the airframe endpoint); register in module providers
- [ ] 1.3 Cucumber: ATA reference list returns grouped categories with `OTHER`

## 2. ETOPS capability (independent) — capability `aircraft-etops-capability`

- [x] 2.1 Add `etopsThresholdMinutes Int?` to the `Aircraft` model in `schema.prisma`; generate migration; regenerate client (`prisma/client/`)
- [x] 2.2 Extend `UpdateAircraftRequest` with `etopsThresholdMinutes` validated to `{60,75,90,120,180}` or null; thread through `update-aircraft.command` + repository
- [x] 2.3 Expose `etopsThresholdMinutes` on `GetAircraftResponse`
- [x] 2.4 Cucumber (seed-based): set valid threshold; reject invalid value; non-ops 403; visible on read

## 3. Utilization ledger (independent) — capability `aircraft-utilization`

- [ ] 3.1 Add `AircraftOperationDetails` model (1:1 with aircraft, TTSN totals + TTSO anchors) to `schema.prisma`; generate migration; backfill a zeroed row per existing aircraft; regenerate client
- [ ] 3.2 `AircraftOperationDetails` repository (find / create-zeroed / increment) + domain model
- [ ] 3.3 `accrue-utilization` listener on `OnBlockWasReportedEvent`: add flight/block minutes + 1 cycle from `timesheet.actual`, missing-timestamp-safe, idempotent per flight
- [ ] 3.4 `get-operation-details` query exposing TTSN (flight/block/cycles) and derived TTSO
- [ ] 3.5 Seed fixtures: operation-details rows with fixed uuid4 ids across a few tails
- [ ] 3.6 Cucumber (seed-based): zeroed on create; TTSO == TTSN; sector accrual + diversion cycle; no double-count

## 4. Defect reporting — pilot (needs 1) — capability `aircraft-defect-log`

- [ ] 4.1 Add `AircraftDefect` model + `AircraftDefectStatus` / `AircraftDefectClassification` enums to `schema.prisma`; generate migration; regenerate client
- [ ] 4.2 `AircraftDefect` repository (create, list open-first, find by id, exists-open) + domain model + typed errors
- [ ] 4.3 `UserAircraftRepository.existsForUserAndAircraft` + `PilotHasNotFlownAircraftError`
- [ ] 4.4 `report-defect.command` + `POST …/aircraft/:aircraftId/defects` (ATA-validated, guard, default `reportedOnFlightId`)
- [ ] 4.5 `list-defects` + `get-defect` queries + `GET …/defects` (open-first) and `GET …/defects/:defectId`
- [ ] 4.6 Seed fixtures: defects covering every status × classification (fixed uuid4)
- [ ] 4.7 Cucumber (seed-based): file defect; category/sub-chapter required; guard 403; list open-before-history; get by id

## 5. Defect triage — operations (needs 2, 4) — capability `aircraft-defect-log`

- [ ] 5.1 Classification-options service deriving `choices(T)` from the aircraft threshold + `GET …/defects/classification-options`
- [ ] 5.2 `confirm-defect.command` + `PATCH …/confirm` (validate classification against `choices(T)`; store `etopsLimitMinutes`)
- [ ] 5.3 `reject-defect.command` + `PATCH …/reject` (from `reported` only)
- [ ] 5.4 `resolve-defect.command` + `PATCH …/resolve` (from `confirmed` only; `resolutionNote`)
- [ ] 5.5 Cucumber (seed-based): options reflect threshold; confirm+limit; reject limit≥T; invalid transitions; non-ops 403

## 6. Derived technical status + logbook feed (needs 3, 5) — capability `aircraft-technical-status`

- [ ] 6.1 `get-technical-status` query: serviceable / etopsReady / effectiveEtops (most-restrictive-wins; only confirmed defects) + TTSN + open-defect summary
- [ ] 6.2 `GET …/technical-status` (and/or enrich the existing aircraft GET)
- [ ] 6.3 `get-logbook-feed` query + `GET …/logbook` (read-time union: defects ⊕ repositions ⊕ completed sectors, most-recent-first)
- [ ] 6.4 Cucumber (seed-based): no-defect baseline; most-restrictive limit; prohibited; grounded; reported-pending no effect; feed ordering

## 7. Flight fuel breakdown + close-out (independent) — capability `flight-fuel-planning`

- [x] 7.1 Add `Flight.actualFuelBurned Decimal?` (tons) to `schema.prisma`; generate migration; regenerate client
- [x] 7.2 Add nested `fuel` breakdown (block/taxi/trip/alternate/reserve/contingency type+amount/MEL/ATC/WXX/extra/tankering, tons) to the `Loadsheet` DTO; keep `blockFuel` as the summary figure consistent with `fuel.block`. Also carries the OFP planning figures (etops/minTakeoff/planTakeoff/planLanding/averageFuelFlow/maxTanks) as optional fields
- [x] 7.3 Map SimBrief OFP fuel into `loadsheets.preliminary.fuel` in `create-flight-from-simbrief.command` (fuel + fuel_extra.bucket + general.cont_rule)
- [x] 7.4 Manual fuel entry via the preliminary/final loadsheet DTOs (non-SimBrief flights)
- [x] 7.5 Extend `close-flight.command` with an optional `actualFuelBurned`; expose it on the flight so the planned-vs-actual delta (vs loadsheet `fuel.trip`) is derivable (delta not returned by the API)
- [x] 7.6 Cucumber (seed-based): SimBrief populates breakdown + blockFuel summary; manual entry; close captures actual + delta; close without actual fuel

## 8. Definition of Done (applied inside every group above)

- [ ] 8.1 `docker compose exec app npm run lint` + `format:fix` + `build` pass
- [ ] 8.2 The group's `features/aircraft/` Cucumber suite passes (reconcile scenarios with seed + side effects first)
- [ ] 8.3 `openspec validate add-aircraft-technical-logbook --strict` stays green
