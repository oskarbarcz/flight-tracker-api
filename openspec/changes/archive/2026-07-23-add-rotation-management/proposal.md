## Why

Operations needs to plan a pilot's full day of flying up front — a connected chain of sectors — before the individual flights for those sectors exist. The retired rotation feature could only group flights that had _already_ been created, and it leaked `rotationId` into every flight lifecycle event, coupling three modules together. This change reintroduces rotations as an independent domain built around a _plan_ (the intent to fly a sector) that a real flight is attached to later, with the flight remaining completely ignorant of rotations.

## What Changes

- Introduce a `rotations` domain: a **rotation** owns an ordered set of **legs**, is scoped to an operator, and is assigned to one pilot.
- A **leg is the plan**: it carries the committed route (`departure`, `arrival`) and intended times (`offBlockTime`, `onBlockTime`), with `blockTime` computed on read. A leg optionally references one real flight.
- Operations build the rotation in `draft` (full CRUD over legs), then **mark it `ready`**, which freezes the set of legs (times of not-yet-flown legs stay editable) and commits it.
- Operations **attach a `created` flight** to a leg — validated so the flight's departure/arrival airports and operator match the leg's plan, the flight is not already used elsewhere, and one flight maps to at most one leg.
- The rotation advances through its lifecycle by **reacting to existing flight domain events**: `ready → in_progress` on the first pilot check-in, `in_progress → finished` when the last leg's flight (by off-block time) closes. The `flights` module gains no knowledge of rotations.
- Rotation reads are **public** (`@SkipAuth()`) to feed a public map; all writes are gated to the Operations role.
- The `flight` table is **unchanged** — no `rotationId` column. The leg is the sole join between a rotation and a flight.

Explicitly **out of scope for this change**: diversions, cancellation, and cleanup when an attached flight is deleted at the flight level.

## Capabilities

### New Capabilities

- `rotation-management`: creating and building rotations and their legs, the draft→ready→in_progress→finished lifecycle, flight attachment/detachment with validation, event-driven transitions off flight lifecycle events, and public read access.

### Modified Capabilities

<!-- None. Rotation was never captured as an openspec/specs/ capability, and this change does not alter the documented requirements of any existing capability (flight lifecycle events are consumed, not changed). -->

## Impact

- **New module:** `src/modules/rotations/` (model, application command/query/event/assert, infra database/http), registered in `AppModule`.
- **Database:** two new tables `rotation` and `rotation_leg` plus a migration. No changes to `flight`, `user`, or `operator` tables.
- **API (additive):** new operator-scoped rotation endpoints (create, leg CRUD, mark-ready, attach/detach flight) gated to Operations; public read endpoints for rotations.
- **Cross-module contract:** rotations reads flight data via `GetFlightQuery` on the `QueryBus` and subscribes to `flight.pilot-checked-in` / `flight.closed` domain events. Dependency direction is one-way (`rotations → flights`).
- **Tests:** new Cucumber features for the rotation lifecycle and attachment validation, plus seed fixtures with fixed UUIDs.
- **Docs:** Swagger API description and `CLAUDE.md` module reference updated to list the `rotations` module.
