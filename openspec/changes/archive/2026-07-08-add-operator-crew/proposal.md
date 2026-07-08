## Why

Flights created from SimBrief carry a full crew roster (first officer, purser, flight attendants), but today the app discards it and stores only hardcoded crew _counts_ in the loadsheet JSON. There is no record of the named people who staff a flight, so a pilot cannot see who they are flying with. This change introduces named crew as first-class, operator-owned data — the foundation for later showing a pilot the crew of their specific flight.

## What Changes

- Add a `crew` table: named, ambient non-player characters owned by an operator (`id`, `name`, `email`, `operatorId`, `role`, `createdAt`). Crew never sign in — they exist only for flavor.
- Parse the SimBrief OFP `crew` object (currently unmodeled) and import first officer (`fo`), purser (`pu`), and flight attendants (`fa[]`) on flight creation. Captain (`cpt`, the live player) and dispatcher (`dx`, not aircraft crew) are excluded.
- Import is idempotent: a crew member is matched by `(operatorId, role, name)` and created only when absent — re-importing the same roster is a no-op.
- Derive each crew member's email from their name and operator: `{first}.{last}@{operatorShortName}.com` (lowercased, e.g. `virgil.rivers@lufthansa.com`).
- Expose `GET /api/v1/operator/{operatorId}/crew` to list an operator's crew.
- Model crew as a subdomain of the existing **operators** module (peer to `aircraft` and `rotation`), not a standalone module.

Out of scope (deferred to a later iteration): linking crew to a specific flight, the flight-scoped "pilot sees his crew" view, and populating `Flight.captainId` from the live player.

## Capabilities

### New Capabilities

- `operator-crew`: named crew members owned by an operator — their data model, SimBrief-driven idempotent import, email derivation, and the operator-scoped read endpoint.

### Modified Capabilities

<!-- None. The SimBrief flight-creation handler is extended to dispatch the import, but no existing spec's requirements change. -->

## Impact

- **New Prisma model** `Crew` + enum `CrewRole { fo, pu, fa }`, plus a `crew Crew[]` back-relation on `Operator`. Requires `prisma db push` on dev.
- **operators module** gains a `crew` subdomain: `AssignCrewToFlightCommand` + handler, `ListOperatorCrewQuery` + handler, `CrewRepository`, `CrewController`, crew model + error, all registered in `operators.module.ts`.
- **SimBrief provider DTO** (`simbrief.types.ts`): `OperationalFlightPlan` gains a `crew` type.
- **flights module**: `CreateFlightFromSimbriefHandler` flattens the roster (dropping `cpt`/`dx`) and synchronously dispatches `AssignCrewToFlightCommand` after the flight is created.
- **Mock fixtures**: `docker/mock/simbrief.json` (5 entries) gain a `crew` block; the SimBrief mock must be restarted.
- **Seed**: a `crew` resource seed (fixed UUIDs) for the read-endpoint functional test.
- **New endpoint**: `GET /api/v1/operator/{operatorId}/crew` (JWT-authenticated).
