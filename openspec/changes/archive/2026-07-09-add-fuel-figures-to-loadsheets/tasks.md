## 1. Domain rule (consistency guard)

- [x] 1.1 Add `InconsistentFuelBlockError` to `src/modules/flights/model/error/flight.error.ts` — `extends UnprocessableEntityException`, `super('Fuel breakdown block must equal the loadsheet block fuel.')`.
- [x] 1.2 Create `src/modules/flights/model/loadsheet.policy.ts` exporting `assertFuelBreakdownConsistent(loadsheet: Loadsheet)` — when `loadsheet.fuel` is present, round both `loadsheet.fuel.block` and `loadsheet.blockFuel` to 3 decimals and throw `InconsistentFuelBlockError` if they differ; no-op when `fuel` is absent (mirrors `crew-assignment.policy.ts`).

## 2. Handler wiring

- [x] 2.1 `src/modules/flights/application/command/update-preliminary-loadsheet.command.ts` — call `assertFuelBreakdownConsistent(loadsheet)` after the status guard and before persisting; change `updateLoadsheets(flightId, { preliminary: loadsheet, final: null })` to preserve the existing final: `{ preliminary: loadsheet, final: flight.loadsheets.final }`.
- [x] 2.2 `src/modules/flights/application/command/finish-boarding.command.ts` — call `assertFuelBreakdownConsistent(finalLoadsheet)` after the status guard and before persisting.
- [x] 2.3 Confirm no module change is needed — the policy and error are plain functions/classes, not CQRS providers (both handlers are already registered in `flights.module.ts`).

## 3. HTTP / docs

- [x] 3.1 `src/modules/flights/infra/http/action/lifecycle/finish-boarding.action.ts` — add a `fuel` example to the `@ApiBody` so the final-loadsheet fuel breakdown is discoverable in Swagger (the `Loadsheet` type already documents the `fuel` field, so no DTO change).

## 4. Seed fixture (preserve-final coverage)

- [x] 4.1 Per user decision, reuse the existing `created` flight AAL4907 (`e91e13a9-...`) rather than add a new flight (a new flight would shift global counts in `flight.list`/`flight-history.list`). Give AAL4907 a non-null seeded `final` loadsheet in `prisma/seed/resource/flights.seed.ts`. Update every existing AAL4907 full-body assertion to include the seeded `final` (`flight.change-visibility`, `flight.update-scheduled-timesheet`, `flight.update-predicted-timesheet` ×3, `flight.mark-as-ready`, and both full-body scenarios in `flight.update-preliminary-loadsheet`).

## 5. Feature tests

- [x] 5.1 Statically reconcile new/edited scenarios against `flights.seed.ts` and the flight lifecycle (flight ids, statuses, existing events, full-body fields, `I set database to initial state` placement) before running the suite — confirmed deep-compare is exact-key at every level, enumerated all AAL4907 body assertions, and verified block==blockFuel on every seeded/asserted fuel.
- [x] 5.2 `features/flight/actions/flight.finish-boarding.feature` — added `fuel` (block 11.9 == blockFuel 11.9) to the existing success scenario's final loadsheet (request + asserted `loadsheets.final.fuel`), per `extend_existing_feature_test`, instead of duplicating the ~160-line body.
- [x] 5.3 `features/flight/actions/flight.finish-boarding.feature` — added a scenario: cabin crew finishes boarding with `fuel.block != blockFuel`; asserts `422` with `{ statusCode: 422, error: "Unprocessable Entity", message: "Fuel breakdown block must equal the loadsheet block fuel." }` (error-only, matching sibling negative scenarios; the guard rejects before any persistence).
- [x] 5.4 `features/flight/management/flight.update-preliminary-loadsheet.feature` — extended the "enter a fuel breakdown manually" scenario with the optional extended figures (`etops`, `minTakeoff`, `planTakeoff`, `planLanding`, `averageFuelFlow`, `maxTanks`) in both the request `fuel` and the asserted GET body.
- [x] 5.5 `features/flight/management/flight.update-preliminary-loadsheet.feature` — added a scenario: operations updates AAL4907's preliminary with `fuel.block != blockFuel`; asserts `422` with the `InconsistentFuelBlockError` body (error-only).
- [x] 5.6 Preserve-final: folded into the existing update-preliminary scenarios — because AAL4907 now carries a seeded `final`, those scenarios PATCH the preliminary and their GET asserts `loadsheets.final` still equals the seeded final (proving the `final:null` reset is gone), avoiding a redundant full-body scenario.

## 6. Verify

- [x] 6.1 `docker compose exec app npm run lint` and `docker compose exec app npm run format:fix` — clean.
- [x] 6.2 `docker compose exec app npm run build` — exit 0.
- [x] 6.3 Ran the affected features (the two core plus every AAL4907-touching feature): finish-boarding + update-preliminary-loadsheet (20 scenarios), change-visibility + scheduled/predicted timesheets + mark-as-ready (39), rotation add/remove + list + delete + start-boarding (44) — all green (103 scenarios).
- [x] 6.4 `openspec validate add-fuel-figures-to-loadsheets --strict` — valid.
