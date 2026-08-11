## Why

An operator record says what kind of airline it is commercially — `legacy`, `low_cost`, `charter`, `government_military` — but says nothing about what it carries. Clients cannot tell a freight carrier from a passenger airline, and operations have no way to record the distinction when they onboard a carrier. Flights already carry `serviceType` (`passenger` / `cargo`), so a consumer can classify a single leg but not the airline operating it. The value is descriptive metadata clients need today; the backend derives no behaviour from it.

## What Changes

- Add a `serviceType` attribute to the operator domain model with values `passenger`, `cargo`, and `both`, defaulting to `passenger`. Every existing operator becomes `passenger`.
- Keep it independent of the existing `type` attribute. `type` records the commercial model, `serviceType` records the traffic carried, and any combination of the two is valid.
- Expose `serviceType` in every response that carries a full operator body: `GET /api/v1/operator/{id}`, `GET /api/v1/operator`, the `recentOnly=true` variant of that list, and the bodies returned by `POST /api/v1/operator` and `PATCH /api/v1/operator/{id}`. All of them serialize the same `Operator` model class, so they pick it up together.
- Leave the abbreviated operator embedded in flight and aircraft bodies untouched. That shape is `LegacyOperatorResponse`, a six-field identity projection (`id`, `icaoCode`, `iataCode`, `shortName`, `fullName`, `callsign`), and it gains no field.
- Accept `serviceType` on operator creation and on the existing generic `PATCH /api/v1/operator/{id}`. No new endpoint: both request DTOs are derived from the `Operator` model, so the field becomes settable and patchable as soon as it exists on the model.
- Impose no lifecycle restriction on the mutation. Unlike a flight, an operator has no status, so there is nothing to freeze the value against — operations can correct it at any time.
- No service-type-specific backend behaviour: fleet aggregation, crew rules, flight creation, rotations, and statistics are untouched.

## Capabilities

### New Capabilities

- `operator-service-type`: classification of an operator by the traffic it carries — the default on creation, its independence from the commercial `type`, how it is exposed in operator read models, and the operations-only mutation that changes it.

### Modified Capabilities

None. The two existing operator specs are unaffected: `operator-crew` describes crew composition rules, and `operator-recent-carriers` already requires the recent-carrier body to carry "the identical fields and field names as the entries of the unfiltered operator list" — a field-agnostic requirement that a new field satisfies without amendment. No existing spec describes operator creation, operator read models, or the operator attribute set.

## Impact

**Database** — `prisma/schema.prisma`: new `OperatorServiceType` enum (`passenger`, `cargo`, `both`) plus a `serviceType` column on `model Operator` defaulting to `passenger`. Requires a migration and a `prisma generate`; the dev database needs the column applied separately (see `design.md` § Migration Plan).

**API** — one new field on the operator read model, and one new accepted field on the operator create and update request bodies. Additive only, no breaking change for clients. Swagger picks it up from the decorated model.

**Code** — `src/modules/operators/`: `model/operator.model.ts` (enum + `Operator` property), `infra/http/request/operator.request.ts` (the create default), and `infra/database/repository/operators.repository.ts` (the enum cast in `toDomain`). No new action, command, query, or module registration — the generic create and update paths already carry the field.

**External providers** — none.

**Tests** — `serviceType` must be absorbed by every full-operator-body assertion in the suite: the five `features/operator/` features plus the three `features/aircraft/` features that verify a fleet-size side effect by re-reading the operator. New coverage for setting the field on create and patching it on update, and the repository unit-test fixture gains the field.
