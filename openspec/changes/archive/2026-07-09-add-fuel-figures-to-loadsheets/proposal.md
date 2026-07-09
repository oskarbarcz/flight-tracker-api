## Why

The structured `fuel` breakdown (block, taxi, trip, alternate, reserve, contingency, MEL, ATC, WXX, extra, tankering, plus optional takeoff/landing/flow figures) was added to the loadsheet and is populated from the SimBrief OFP on flight creation. Because both loadsheet write endpoints bind to the shared `Loadsheet` class, they already _accept_ `fuel` structurally — but only the preliminary-update path is specified and tested. The **final loadsheet** filled at finish-boarding has no fuel coverage, its docs omit the field, and neither path enforces that the breakdown reconciles with the `blockFuel` summary. We want fuel to be a first-class, verified part of _both_ write flows, with the summary-vs-breakdown consistency guaranteed.

## What Changes

- **Consistency rule (both flows):** when a `fuel` breakdown is supplied, its `block` MUST equal the loadsheet's `blockFuel` summary; a mismatch is rejected `422`. Enforced by a shared domain guard used by both the preliminary-update and finish-boarding handlers.
- **Final loadsheet fuel is first-class:** `POST /flight/:id/finish-boarding` accepts, persists, and reads back a `fuel` breakdown on `loadsheets.final`; covered by a feature scenario and a Swagger request example.
- **Preliminary loadsheet fuel formalized:** the already-shipped manual-fuel entry on `PATCH /flight/:id/loadsheet/preliminary` is captured as a spec requirement and its test extended to include the optional extended figures (`minTakeoff`, `planTakeoff`, `planLanding`, `averageFuelFlow`, `maxTanks`, `etops`).
- **Edge case — preserve `final`:** `UpdatePreliminaryLoadsheetHandler` stops hard-resetting `final: null` on every preliminary edit and preserves any existing `final` loadsheet.
- No new persistence: fuel continues to live inside the `Flight.loadsheets` JSON column — no schema or migration change.

## Capabilities

### New Capabilities

<!-- None. -->

### Modified Capabilities

- `flight-fuel-planning`: extends the fuel-planning capability (introduced alongside the SimBrief fuel import) with requirements for entering the fuel breakdown through both loadsheet write endpoints and the block-vs-summary consistency rule. The capability is not yet synced into `openspec/specs/`; this change contributes an additive delta to it.

## Impact

- **Domain:** new `src/modules/flights/model/loadsheet.policy.ts` with `assertFuelBreakdownConsistent(loadsheet)` (mirrors `crew-assignment.policy.ts`); new `InconsistentFuelBlockError` in `src/modules/flights/model/error/flight.error.ts` (typed `UnprocessableEntityException`).
- **Handlers:** `UpdatePreliminaryLoadsheetHandler` and `FinishBoardingHandler` call the guard before persisting; the preliminary handler preserves `final` instead of nulling it.
- **HTTP/docs:** finish-boarding `@ApiBody` gains a fuel example; no new endpoints, no signature changes (both already take `Loadsheet`).
- **Tests:** new finish-boarding fuel round-trip scenario; extended preliminary scenario; new inconsistency-rejection scenarios on both endpoints. Seed fixtures already provide flights whose loadsheets carry fuel.
- **No breaking changes:** `fuel` remains optional; requests without it behave exactly as before.
