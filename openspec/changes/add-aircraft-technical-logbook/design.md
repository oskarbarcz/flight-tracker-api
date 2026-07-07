# Design — Aircraft Technical Logbook

## Context

The `Aircraft` entity lives in the `operators` module alongside reposition and
flight-history. There is no maintenance/technical concept today. Reusable precedent:
`FlightEvent` (typed event log), `AircraftReposition` (aircraft-scoped child table with
its own enums + a flight-lifecycle listener), `UserAircraft` (append-on-`PilotCheckedIn`
and the flown-aircraft history), and the airframes reference-data pattern
(`airframes.json` + helper + query).

Durations are stored as **integer minutes**. Fuel and weights are **tons (decimal)** —
the established house convention (`Loadsheet.blockFuel`, `cargo`, `payload` are all tons).
The Prisma client is emitted to `prisma/client/`; imports stay `from 'prisma/client/client'`.
New CQRS handlers must be registered in the module `providers` array. Errors are thrown
as typed classes from `model/error/*.error.ts`, never `NotFoundException(DTO)`.

## Goals / Non-goals

**Goals:** pilot-facing defect reporting + ops triage; automatic TTSN/cycles ledger;
ETOPS capability on the tail; derived (display-only) serviceability & effective ETOPS;
structured fuel plan + actual-burn capture; ATA reference data.

**Non-goals (deferred, wired for but not built):**

- Overhaul action that resets TTSO. Schema carries `*AtLastOverhaul` anchors so TTSO is
  already derivable (`== TTSN` until the first overhaul); no ops action yet.
- Operational enforcement. Classification and derived status are **informational**;
  nothing blocks dispatch, check-in, or flight creation.

## Module placement

Everything lands in `operators`, under an internal `aircraft/logbook/` sub-namespace to
keep the (already large) module legible:

```
src/modules/operators/
  application/command/aircraft/logbook/   report-defect, confirm-defect, reject-defect, resolve-defect
  application/query/aircraft/logbook/     list-defects, get-defect, get-operation-details, get-technical-status, get-logbook-feed
  application/event/external/             (extend) accrue-utilization.listener (on OnBlock)
  infra/database/repository/              aircraft-operation-details.repository, aircraft-defect.repository
  infra/http/action|controller/          defect endpoints, operation-details/technical-status endpoints
  model/                                  defect + operation-details + technical-status types
  model/error/                            defect + guard errors
  data/                                   ata-chapters.json + ata.ts helper (+ list query)
```

The `flights` module owns the fuel changes (fuel plan model, SimBrief mapping,
close-flight body).

## Data model

### `Aircraft` (existing table) — one new column

- `etopsThresholdMinutes Int?` — `NULL` = not ETOPS-certified; otherwise one of
  `60 | 75 | 90 | 120 | 180`. Set at aircraft creation or through the edit-aircraft
  endpoint (both `@Role(Operations)`), validated against that fixed ladder.

> **Single field, deliberately.** Collapses "is ETOPS allowed?" + "certified minutes"
> into one value that cannot self-contradict (no `allowed=false, threshold=180`). `NULL`
> is the single source of "not certified".

### `AircraftOperationDetails` (new, 1:1 with `Aircraft`)

| field                         | type            | notes                           |
| ----------------------------- | --------------- | ------------------------------- |
| `aircraftId`                  | uuid unique FK  | 1:1                             |
| `totalFlightMinutes`          | Int @default(0) | TTSN airborne (takeoff→arrival) |
| `totalBlockMinutes`           | Int @default(0) | TTSN block (offBlock→onBlock)   |
| `totalCycles`                 | Int @default(0) | +1 per completed sector         |
| `flightMinutesAtLastOverhaul` | Int @default(0) | TTSO anchor (deferred)          |
| `blockMinutesAtLastOverhaul`  | Int @default(0) | TTSO anchor (deferred)          |
| `cyclesAtLastOverhaul`        | Int @default(0) | TTSO anchor (deferred)          |
| `lastOverhaulAt`              | DateTime?       | deferred                        |
| `createdAt` / `updatedAt`     | DateTime        |                                 |

TTSO (since overhaul) is **derived**: `total − *AtLastOverhaul`. Anchors default to 0, so
TTSO == TTSN until an overhaul is ever recorded. Aircraft start **zeroed** at creation
(no real-world baseline import) — the ledger counts in-app activity only.

### `AircraftDefect` (new)

| field                           | type                            | notes                                                                  |
| ------------------------------- | ------------------------------- | ---------------------------------------------------------------------- |
| `id`                            | uuid PK                         |                                                                        |
| `aircraftId`                    | uuid FK                         |                                                                        |
| `ataCategory`                   | String                          | high-level group key (ATA ref)                                         |
| `ataSubchapter`                 | String                          | chapter value or `OTHER` (ATA ref)                                     |
| `description`                   | String                          | free text                                                              |
| `reportedById`                  | uuid FK User                    | the pilot                                                              |
| `reportedOnFlightId`            | uuid? FK Flight                 | defaults to the reporter's most-recent sector on the tail; overridable |
| `reportedAt`                    | DateTime @default(now())        |                                                                        |
| `status`                        | `AircraftDefectStatus`          | `reported \| confirmed \| rejected \| resolved`                        |
| `classification`                | `AircraftDefectClassification?` | null until confirmed                                                   |
| `etopsLimitMinutes`             | Int?                            | set only when `classification = etops_limit`                           |
| `confirmedById` / `confirmedAt` | uuid? / DateTime?               |                                                                        |
| `rejectedById` / `rejectedAt`   | uuid? / DateTime?               |                                                                        |
| `resolvedById` / `resolvedAt`   | uuid? / DateTime?               |                                                                        |
| `resolutionNote`                | String?                         | set on resolve                                                         |

Enums:

- `AircraftDefectStatus = reported | confirmed | rejected | resolved`
- `AircraftDefectClassification = info | etops_limit | etops_prohibited | grounded`

### Fuel — nested in the loadsheet (no new fuel column)

The planned fuel breakdown lives **inside the existing `Flight.loadsheets` Json**, as a
`fuel` object on each `Loadsheet` (so both `preliminary` — ops/SimBrief — and `final` —
pilot — can carry it). `Loadsheet.blockFuel` is retained as the **summary** figure (the
block/ramp total), kept consistent with `fuel.block`. Because `loadsheets` is already a
Json column, this needs **no migration** — only DTO/validation and importer changes.

`Loadsheet.fuel` shape (all amounts tons decimal, 3dp):

```
block, taxi, trip, alternate, reserve,
contingencyType (text), contingencyAmount,
mel, atc, wxx, extra, tankering
```

Actual fuel is captured at close as a single **optional** value on the flight:

- `Flight.actualFuelBurned Decimal?` (tons) — the only new fuel **column**. The close-out
  delta compares it against the planned `fuel.trip`.

## Key algorithms

### Utilization accrual (automatic)

A listener on `OnBlockWasReportedEvent` (times are final at on-block, per decision) reads
`timesheet.actual` and increments the aircraft's operation-details:

```
flightMinutes = minutes(actual.arrivalTime − actual.takeoffTime)
blockMinutes  = minutes(actual.onBlockTime − actual.offBlockTime)
totalFlightMinutes += flightMinutes
totalBlockMinutes  += blockMinutes
totalCycles        += 1        // one landing = one cycle; diversions still count
```

If any required timestamp is missing, skip that component defensively rather than storing
a negative/garbage delta. Accrual is idempotent-guarded so a re-emitted event does not
double-count (e.g. key off flight id already accrued).

### Dynamic ETOPS classification (at confirm)

Confirm choices are generated from the aircraft's certified `etopsThresholdMinutes T`
using the fixed ladder `[60,75,90,120,180]`:

```
choices(T):
  • info                                        → classification = info
  • for each L in ladder where L < T:  limit-to-L → etops_limit, etopsLimitMinutes = L
  • no ETOPS at all                             → etops_prohibited
  • ground the aircraft                         → grounded          (informational)

T = null (not certified): only { info, grounded } are offered (ETOPS limits N/A).
```

Server validates the submitted classification against `choices(T)` — e.g. `limit-to-120`
on a 90-min tail is rejected.

### Derived technical status (read-only)

Only **confirmed** defects impose effect (classification is set at confirm). `reported`
defects are visible and shown as _pending review_ but have no computed effect;
`rejected`/`resolved` have none.

```
openConfirmed = defects where status = confirmed
grounded?   = any openConfirmed.classification = grounded
serviceable = not grounded?

effectiveEtops:
  if aircraft.etopsThresholdMinutes is null      → null (not certified)
  else if grounded?                              → null (unserviceable ⇒ no ETOPS)
  else if any openConfirmed = etops_prohibited   → null (ETOPS prohibited)
  else  min( certified, min(openConfirmed.etopsLimitMinutes) )   // most-restrictive wins

etopsReady = effectiveEtops != null
```

## API surface

Base: `/api/v1/operator/:operatorId/aircraft/:aircraftId`

Defects:

- `POST   …/defects` — pilot report. Guard: a `user_aircraft` row exists for
  `(reporter, aircraft)`, else `PilotHasNotFlownAircraftError` (403). Body:
  `ataCategory`, `ataSubchapter`, `description`, optional `reportedOnFlightId`.
- `GET    …/defects` — list; open first, then history (resolved/rejected). Optional
  `?status=` filter.
- `GET    …/defects/:defectId` — detail.
- `GET    …/defects/classification-options` — the dynamic `choices(T)` for UIs.
- `PATCH  …/defects/:defectId/confirm` — `@Role(Operations)`; body: classification (+
  `etopsLimitMinutes` when `etops_limit`).
- `PATCH  …/defects/:defectId/reject` — `@Role(Operations)`; from `reported` only.
- `PATCH  …/defects/:defectId/resolve` — `@Role(Operations)`; from `confirmed` only;
  body: `resolutionNote`.

Status / ledger:

- `GET …/technical-status` — serviceable, etopsReady, effectiveEtops, TTSN flight/block,
  cycles, open-defect summary. (May also enrich the existing aircraft GET response.)
- `GET …/logbook` — chronological feed = defects ⊕ repositions ⊕ completed sectors.

ETOPS: extend `PATCH …/aircraft/:aircraftId` with `etopsThresholdMinutes`.

ATA reference: `GET /api/v1/ata-chapters` (list), mirroring the airframe endpoint.

Fuel: SimBrief import populates `loadsheets.preliminary.fuel`; the preliminary/final
loadsheet DTOs carry the `fuel` breakdown for manual entry; `close-flight` body gains an
optional `actualFuelBurned`.

**Permissions:** viewing (defects, status, logbook) — any authenticated user. Reporting —
authenticated + passed the flown-aircraft guard. Triage & ETOPS edit —
`@Role(Operations)`.

## Defect state machine

```
 reported ──confirm──▶ confirmed ──resolve──▶ resolved
    │                                     (kept in history)
    └──reject──▶ rejected (terminal)
 visible to pilots from "reported" onward
```

## Fuel: SimBrief mapping

SimBrief OFP `fuel.*` maps into `loadsheets.preliminary.fuel` (e.g. `plan_ramp → block`,
`taxi → taxi`, `enroute_burn → trip`, `alternate_burn → alternate`, `contingency →
contingencyAmount`, `reserve → reserve`). MEL/ATC/WXX/EXTRA/TANKERING map from the OFP's
additional-fuel buckets where present, else `0`/null. `ofpWeightToTons` already exists in
the importer, which keeps `blockFuel` (summary) consistent with `fuel.block`.

## Seeding, migration, testing

- Schema changes are **split across their owning tasks** (no shared foundations
  migration): `Aircraft.etopsThresholdMinutes` ships with ETOPS; `aircraft_operation_details`
  - the zeroed backfill ships with utilization; `aircraft_defect` + enums ship with defect
    reporting; `Flight.actualFuelBurned` ships with fuel. The fuel breakdown nests in the
    existing `loadsheets` Json (no migration).
- Seed fixtures (`prisma/seed/`) add: ETOPS thresholds on a few tails (incl. a
  non-certified one), operation-details rows, and a spread of defects covering every
  status × classification so read/derivation scenarios have fixtures. Use **real uuid4**
  ids, not patterned ones. `loadResources()` runs in one transaction.
- Cucumber, **seed-based** (per house practice): seed fixtures with fixed UUIDs and test
  the GET/derivation against them; do not drive the full lifecycle to manufacture state,
  and do not add "remember"-style steps to the REST context. Assert **full response
  bodies**. New features under `features/aircraft/`.

## Resolved decisions

1. **Fuel fields** — the breakdown includes `trip` and `alternate` fuel, alongside block,
   taxi, reserve, contingency (type + amount), MEL, ATC, WXX, extra, and tankering.
2. **Fuel placement** — the breakdown nests under `Loadsheet.fuel`; `blockFuel` stays as
   the summary figure. No new fuel column beyond `actualFuelBurned`.
3. **Actual fuel at close** — `actualFuelBurned` is **optional**; only burn is captured,
   compared against planned `fuel.trip`.
4. **`reportedOnFlightId`** — auto-linked to the reporter's most-recent sector on the tail
   (overridable).
