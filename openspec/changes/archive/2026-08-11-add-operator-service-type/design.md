## Context

See `proposal.md` § Why for motivation and `specs/operator-service-type/spec.md` for the behaviour contract.

Four pieces of current state shape the approach:

**`type` is already taken on `Operator`.** `model/operator.model.ts` declares `OperatorType { legacy, low_cost, charter, government_military }` on the property named `type`, and it means the commercial model of the airline. The traffic an operator carries is an orthogonal axis, so it needs its own property name — the requested "passenger | cargo | both" cannot land on `type`.

**Flights already model the same axis.** `schema.prisma` carries `enum FlightServiceType { passenger cargo }` and `Flight.serviceType`, added by the archived `flight-service-type` change, and it means exactly this: what the service carries. The operator-level attribute is the same concept one level up.

**Operator requests are derived from the model, not hand-written.** `infra/http/request/operator.request.ts` builds `CreateOperatorRequest` from `OmitType(Operator, ['id', 'fleetSize', 'fleetTypes'])` and `UpdateOperatorRequest` from `PartialType` of the same base. A property added to the `Operator` class is therefore accepted by `POST /api/v1/operator` and `PATCH /api/v1/operator/{id}` with no action, command, or DTO change — only the create-time default has to be declared.

**Operators have no lifecycle.** There is no status column and no state machine on `Operator`, unlike `Flight` with its `created → ready → …` progression. The flight-level equivalent of this attribute is frozen once the flight is marked ready; there is no analogous point in an operator's life at which freezing would mean anything.

## Goals / Non-Goals

**Goals:**

- Name the attribute so that it reads as the same concept as `Flight.serviceType`, one level up.
- Reach every full operator read payload without touching each response class.
- Leave the abbreviated embedded operator shape alone, so flight and aircraft bodies do not grow.

**Non-Goals:**

- Filtering or sorting the operator list by service type. The field is returned; no query parameter is added.
- Deriving a flight's `serviceType` from its operator's. A cargo carrier can fly a positioning leg with passengers aboard and a passenger carrier can fly a freight-only leg; the two values stay independent, each set on its own record.
- Validating an operator's service type against the fleet or against the flights it operates. A `cargo` operator with passenger flights is accepted.
- Backfilling real-world values for carriers beyond the seed fixtures.

## Decisions

### The property is named `serviceType`, not `type`, `operationType`, or `trafficType`

`Operator` gains `serviceType`, with the domain enum `OperatorServiceType { Passenger = 'passenger', Cargo = 'cargo', Both = 'both' }` in `model/operator.model.ts`.

_Why:_ `Flight.serviceType` already names this exact axis with these exact literals, so a client reading a flight body and an operator body sees one vocabulary. `type` is unavailable — it holds the commercial model.

_Alternatives considered:_ `operationType` reads naturally on its own ("what kind of operation the airline runs") but invents a second name for a concept the API already names. `trafficType` is the more precise aviation term for the payload carried, and would arguably be the better name in a greenfield schema, but it diverges from the flight-level field for a marginal gain in precision. Both were rejected in favour of consistency with the existing flight attribute.

_Consequence:_ two similarly-named enums now exist, `FlightServiceType` and `OperatorServiceType`, differing only in the extra `both` member. They are deliberately separate types rather than one shared enum — see the next decision.

### A separate enum with a third value, `both`, rather than reusing `FlightServiceType`

`schema.prisma` gains `enum OperatorServiceType { passenger cargo both }` alongside the existing two-member `FlightServiceType`.

_Why:_ a single flight either carries passengers or it carries freight — the two-value set is correct there and a third value would be meaningless on a leg. An airline is not so constrained: most network carriers run both a passenger operation and a freight operation, and forcing a choice would make the field wrong for the majority of real operators. The values also sit in different scopes: `Flight.serviceType` describes one leg, `Operator.serviceType` describes a business.

_Alternative considered:_ adding `both` to `FlightServiceType` and sharing one enum across both models. Rejected: it would admit a nonsensical value on flights, and the migration would widen an enum that the flight-level status guard and SimBrief derivation both reason about exhaustively.

_Consequence:_ a client that filters "show me cargo carriers" must treat `both` as matching, not just `cargo`. The spec states this explicitly so the semantics are not left to each consumer.

### `serviceType` as a Prisma enum with `@default(passenger)`

`Operator.serviceType OperatorServiceType @default(passenger)`, no `@@map`, mirroring how `OperatorType`, `OperatorAlliance`, and `OperatorGroup` are already declared on the same model.

_Why:_ the database rejects invalid values, and the default backfills every existing row as `passenger` in the same `ALTER TABLE` — no nullable interim state and no data-migration step. The domain-side enum stays hand-written in `model/operator.model.ts` because `CLAUDE.md` forbids importing enums from `prisma/client/*` into domain code; `toDomain` in the repository casts the column, exactly as it already does for `type`, `continent`, `alliance`, and `group`.

_Why `passenger` and not a nullable "unknown":_ every operator carries something, and a null would push a tri-state into every consumer for no descriptive gain. The seed sets real values for the fixtures that need them.

### No new endpoint, and no status guard on the mutation

The field is settable via the existing `POST /api/v1/operator` and patchable via the existing `PATCH /api/v1/operator/{id}`, both already `operations`-only. No lifecycle condition is checked.

_Why:_ the request DTOs are `OmitType` / `PartialType` projections of the `Operator` model, so both endpoints accept the field the moment the model declares it — adding an action would duplicate an existing path. And with no status column on `Operator` there is no "the record is now committed" moment to freeze against, so the flight-level `422` guard has no counterpart here.

_Consequence:_ `CreateOperatorRequest` must declare `serviceType: OperatorServiceType = OperatorServiceType.Passenger` so that a create request omitting the field lands on the documented default rather than relying on the database default — the same pattern the class already uses for `type`, `hubs`, `continent`, and `avgFleetAge`.

### The embedded operator projection stays at six fields

`LegacyOperatorResponse` — the operator nested inside flight and aircraft bodies — is `PickType(Operator, ['id', 'icaoCode', 'iataCode', 'shortName', 'fullName', 'callsign'])` and gains nothing.

_Why:_ it exists to identify a carrier inside another resource, not to describe it. Widening it would grow every flight and aircraft body for a value a client can fetch from the operator resource, and the three `features/aircraft/` assertions that appear to carry a full operator body are in fact a follow-up `GET /api/v1/operator/{id}` verifying a fleet-size side effect, not an embedded projection.

### Seed fixtures get a realistic mix, not a uniform default

Lufthansa, American Airlines, British Airways, Air France, and KLM are seeded as `both`; Condor, LOT, and Icelandair stay `passenger`.

_Why:_ the five wide-body network carriers all run freight operations alongside their passenger business, so `both` is the accurate value and the fixtures exercise a non-default value end to end. `cargo` has no accurate fixture among the eight seeded carriers — none is a pure freighter — so it is covered by the create and update scenarios instead of by inventing a freight airline.

## Risks / Trade-offs

**Full-body Cucumber assertions break in bulk** → `features/_helper/deep-compare.ts` matches on exact key count, so every operator-body assertion fails the moment the column exists. Forty occurrences across eight files; the task list treats sweeping the field into them as one explicit step rather than discovering them one failure at a time under `failFast`.

**`both` shifts work onto consumers** → A client filtering for freight carriers must match `cargo` **or** `both`. Made explicit in the spec rather than left implicit in the enum.

**Two near-identical enums** → `FlightServiceType` and `OperatorServiceType` will read as duplication to anyone skimming the schema. Accepted deliberately: the value sets differ, and their scopes differ.

**The value is unvalidated against reality** → Nothing checks that a `cargo` operator's flights are cargo flights, or that a `passenger` operator owns no freighters. Descriptive metadata, consistent with how `type`, `alliance`, and `group` are already treated.

**Dev database drifts from the migration** → The local database was built with `db push` and has no `_prisma_migrations` table, and it carries unrelated column drift from other work. Handled in the migration plan below.

## Migration Plan

1. Edit `schema.prisma` (enum next to `OperatorType`, column on `model Operator`), then `docker compose exec app npx prisma generate` — the client is emitted to `prisma/client/`, so the import path stays `prisma/client/client`.
2. Author `prisma/migrations/<timestamp>_add_operator_service_type/migration.sql` by hand: `CREATE TYPE "OperatorServiceType"` followed by `ALTER TABLE "operator" ADD COLUMN "serviceType" ... NOT NULL DEFAULT 'passenger'`. The default backfills existing rows in the same statement.
3. Apply that SQL to the dev database directly with `docker compose exec -T database psql -U user -d app -f -`. `prisma db push` refuses here without `--accept-data-loss`, because the dev database carries unrelated drift from other branches (`airport.monitorWeather`, `user.defaultWeatherSource`, an older `airport_weather` shape) that a push would drop. Applying only this migration's SQL keeps that drift untouched. Nothing needs reconciling in `_prisma_migrations` — the table does not exist locally.
4. Restart the `app` container and let the watcher settle before running `test:functional`; the Cucumber database context only truncates and reseeds, so it never applies migrations and the column must already be present.
5. Format with Prettier over the touched paths only — a repo-wide `format:fix` churns three unrelated `.feature` files. The Prisma plugin realigns the whole `Operator` block, since `OperatorServiceType` is the longest type name in it.

**Rollback:** the change is additive. Reverting the code leaves an unused column with a valid default; dropping it needs a follow-up migration but no data recovery, since nothing else reads the value.
