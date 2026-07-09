## Context

The `fuel` breakdown (`FuelBreakdown` in `src/modules/flights/model/loadsheet.model.ts`) is an optional nested field on the shared `Loadsheet` class. Both loadsheet write endpoints bind their `@Body()` to that class:

- `PATCH /flight/:id/loadsheet/preliminary` → `UpdatePreliminaryLoadsheetCommand` (operations, flight in `created`).
- `POST /flight/:id/finish-boarding` → `FinishBoardingCommand` (cabin crew, flight in `boarding_started`).

So `fuel` is _already_ accepted, validated (`@ValidateNested` + `@Type`), persisted (whole `{ preliminary, final }` object written to the `Flight.loadsheets` JSON column via `FlightsRepository.updateLoadsheets`), and read back unfiltered by `GetFlightHandler`. The preliminary path is exercised by a passing feature scenario; the final path is not, and its docs/examples omit `fuel`. Neither path enforces that `fuel.block` reconciles with the `blockFuel` summary, and `UpdatePreliminaryLoadsheetHandler` hard-codes `final: null` on every edit.

Constraints from the codebase: no comments in source; cross-field rules live in the domain layer (there are no custom `class-validator` decorators anywhere); domain guards follow the `model/*.policy.ts` + typed-error convention (`crew-assignment.policy.ts` → `assertCrewIsModifiable` → throws `InvalidStatusToModifyCrewError` from `model/error/flight.error.ts`). Fuel lives in JSON, so there is no schema or migration work.

## Goals / Non-Goals

**Goals:**

- Make the `fuel` breakdown a first-class, tested part of the final loadsheet (finish-boarding), matching the preliminary path.
- Guarantee `fuel.block` equals `blockFuel` on any supplied breakdown, on both write flows.
- Stop the preliminary update from discarding an existing final loadsheet.
- Formalize the fuel-entry behaviour as `flight-fuel-planning` spec requirements and cover the extended optional figures in tests.

**Non-Goals:**

- No new endpoints, no request/response signature changes (both handlers already take `Loadsheet`).
- No schema/migration change; fuel stays in the `Flight.loadsheets` JSON column.
- No SimBrief-sourced fuel feeding these manual write endpoints (SimBrief only populates on create).
- No planned-vs-actual delta computation (owned by the separate close-flight / actual-fuel work).
- No change to the numeric shape of `FuelBreakdown` (fields, decimal precision, optionality).

## Decisions

**1. Consistency enforced by a domain policy, not a request validator.**
Add `src/modules/flights/model/loadsheet.policy.ts` exporting `assertFuelBreakdownConsistent(loadsheet: Loadsheet)`: when `loadsheet.fuel` is present and `fuel.block !== blockFuel`, throw `InconsistentFuelBlockError`. Both `UpdatePreliminaryLoadsheetHandler` and `FinishBoardingHandler` call it before persisting.

- _Why:_ mirrors the established `crew-assignment.policy.ts` pattern and keeps the rule in one place shared by both handlers. The repo has no custom `class-validator` decorators, so a DTO-level cross-field validator would be a new pattern for a one-line rule.
- _Alternative considered:_ a custom `@IsBlockConsistent()` class-validator producing `400`. Rejected — introduces a validation pattern that doesn't exist here, and a semantic mismatch of well-formed figures is better modelled as `422` (unprocessable) than `400` (malformed).

**2. `InconsistentFuelBlockError` is a typed `UnprocessableEntityException` in `model/error/flight.error.ts`.**
`super('Fuel breakdown block must equal the loadsheet block fuel.')`, following the newer typed-error convention (per repo feedback: throw typed error classes, never `throw new XException(SomeDTO)`).

- _Response shape:_ this yields `{ statusCode: 422, error: "Unprocessable Entity", message: ... }` — the shape the newer typed errors already produce (e.g. crew errors), which is what the new feature scenarios will assert. This intentionally differs from the older loadsheet DTO errors that carry `error: "Unprocessable Content"`; we follow the current convention rather than the legacy DTO strings.

**3. Equality is an exact numeric comparison after rounding both operands to 3 decimals.**
`blockFuel` and `fuel.block` are both tons with `maxDecimalPlaces: 3`. Round both to 3 decimals before comparing to avoid float representation surprises (e.g. `12.7`).

- _Why:_ the model already constrains both to 3 decimals; rounding to the same precision makes the rule deterministic without inventing a tolerance band.

**4. Preserve `final` on preliminary update.**
Change `UpdatePreliminaryLoadsheetHandler` from `{ preliminary: loadsheet, final: null }` to `{ preliminary: loadsheet, final: flight.loadsheets.final }`.

- _Why:_ discarding `final` is incorrect in principle. It is currently latent (preliminary edits are gated to `created` status, where `final` is always null), so this is a defensive correctness fix with no behaviour change on the reachable path — worth a spec requirement and a test so it can't regress.

**5. Spec delta is `## ADDED Requirements` under `flight-fuel-planning`.**
The capability is not yet in `openspec/specs/` (it exists only as a delta in the in-flight `add-aircraft-technical-logbook` change), and these are new concerns rather than edits to an existing main-spec requirement, so they are ADDED with requirement names distinct from that change's ("Structured planned fuel breakdown…", "Capture actual fuel burned…").

- _Alternative considered:_ a fresh dedicated capability (e.g. `loadsheet-fuel-entry`). Rejected to keep the fuel domain coherent under one capability; the two changes' deltas accumulate cleanly at sync time.

## Risks / Trade-offs

- **Two capabilities' deltas target `flight-fuel-planning`** (this change and `add-aircraft-technical-logbook`) → both use `## ADDED Requirements` with non-overlapping requirement names, so OpenSpec sync appends rather than conflicts. Requirement names were chosen to be distinct.
- **Consistency rule could reject previously-accepted payloads** where `fuel.block ≠ blockFuel` → acceptable and intended; such payloads are internally inconsistent. Existing feature bodies that include `fuel` already keep `block == blockFuel`, so no current test regresses (verify during apply).
- **Error-shape inconsistency across the loadsheet family** (`Unprocessable Entity` vs legacy `Unprocessable Content`) → we deliberately follow the current typed-error convention; the legacy DTO strings are not migrated as part of this change.
- **Float equality** → mitigated by rounding both operands to 3 decimals (Decision 3).

## Migration Plan

Pure application-layer change; no data migration. Deploy is a standard app rollout. Rollback is a code revert — stored loadsheet JSON is unaffected because the field already exists and remains optional.

## Open Questions

- None blocking. If the team later wants SimBrief fuel to pre-fill the manual edit forms, that is a separate change (out of scope here).
