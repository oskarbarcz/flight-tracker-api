## Context

See `proposal.md` § Why for motivation and `specs/flight-service-type/spec.md` for the behaviour contract.

Three pieces of current state shape the approach:

**Flight-level patches are granular today.** `src/modules/flights/infra/http/action/` holds one thin `@Controller` per endpoint, and every flight mutation is its own path: `PATCH /:id/tracking`, `/:id/departure-runway`, `/:id/arrival-parking-position`, `/:id/timesheet/scheduled`, `/:id/loadsheet/preliminary`. There is no `PATCH /api/v1/flight/:id`. Other modules do have generic entity patches (`update-aircraft.action.ts`, `update-operator.action.ts`, `update-airport.action.ts` all use `@Patch(':id')`), so the pattern exists in the codebase — just not in `flights`.

**Read models spread the Prisma row.** `GetFlightHandler` and `ListAllFlightsHandler` both destructure the row and spread `...rest` into `GetFlightResponse`, casting the string-typed columns (`status`, `source`, `tracking`) to their domain enums. A new column therefore flows into every flight response as soon as it exists on the row; only the enum cast has to be added by hand.

**SimBrief carries no cargo flag.** The live OFP JSON (`https://www.simbrief.com/api/xml.fetcher.php?json=1&userid=<id>`) has no flight-type, service, or cargo/passenger field anywhere in `params`, `general`, or `weights`. The nearest signals are `weights.pax_count`, `general.passengers`, `weights.freight_added`, `weights.cargo`, and `aircraft.max_passengers`. `src/core/provider/simbrief/type/simbrief.types.ts` is a hand-maintained narrow subset of that payload, and of those it already declares `weights.pax_count`.

## Goals / Non-Goals

**Goals:**

- One place to add future editable flight attributes, rather than a tenth granular patch path.
- A new column that reaches all flight read payloads without touching each response class.
- Keep the SimBrief heuristic isolated and overridable, so a wrong guess is never a dead end.

**Non-Goals:**

- Filtering or sorting flight lists by service type. The field is returned; no query parameter is added.
- Recording a service type change in the flight event log. No existing granular patch emits an event, and clients get the value from the flight body.
- Migrating the existing granular patch actions into the new generic endpoint. They stay exactly as they are.
- Cargo-specific loadsheet or crew semantics of any kind.

## Decisions

### A generic `PATCH /api/v1/flight/:id` instead of `PATCH /:id/service-type`

The endpoint takes a partial body and applies whichever supported fields are present. Today that is `serviceType` only.

_Why:_ the granular-path convention has produced nine near-identical actions in `flights`, and every future editable attribute adds a tenth. A generic entity patch matches what `aircraft`, `operators`, and `airports` already do, so it is not a new pattern for the codebase — only for this module.

_Alternative considered:_ a tenth granular action, `PATCH /:id/service-type`. Locally more consistent with sibling flight actions and needs no partial-body handling, but it entrenches the proliferation. Rejected in favour of giving flight attribute edits one home.

_Consequence:_ the action must tolerate a body with no fields set. Nest's global validation pipe accepts `{}` against a DTO whose only property is `@IsOptional()`, so an empty body reaches the handler and the command applies nothing — a `204` no-op, as the spec requires. Route registration order is not a concern: `@Patch(':id')` is a distinct path from `@Patch(':id/tracking')`, and no sibling flight route is a bare single segment.

### `serviceType` as a Prisma enum, not a string column

`schema.prisma` gains `enum FlightServiceType { passenger cargo }` and `Flight.serviceType FlightServiceType @default(passenger)`. No `@@map` — the sibling flight enums `FlightSource` and `FlightTracking` declare none, so the generated type name is used as-is.

_Why:_ the database rejects invalid values, and the default backfills every existing row as `passenger` in the same migration — no data-migration step. The domain-side enum stays hand-written in `model/flight.model.ts`, mirroring the Prisma enum's shape the way `UserRole` does, because `CLAUDE.md` forbids importing enums from `prisma/client/*` into domain code.

_Alternative considered:_ a plain `String` column, matching how `Flight.status`, `Flight.source`, and `Flight.tracking` are stored. Rejected: those are legacy shapes, and `FlightSource` / `FlightTracking` already exist as real Prisma enums used elsewhere in the schema, so an enum is not novel here. The cost is a cast-free read at the price of a migration when values are ever added — acceptable for a closed two-value set.

### Derive from `weights.pax_count`, not from the other payload fields

The import handler classifies `cargo` when `weights.pax_count` parses to `0`, `passenger` otherwise, and `passenger` when the value is absent, blank, or non-numeric. No change to `simbrief.types.ts` is needed: `pax_count` is already declared on the `Weights` type and already read by this same handler to fill the preliminary loadsheet's passenger figure.

_Why:_ `pax_count` is the passenger load SimBrief reports for the flight, and reusing the field the handler already parses keeps one source of truth for "how many passengers is this flight carrying". `general.passengers` carries the same number but would have to be added to the type subset and the mock fixture for no gain. `weights.cargo` and `weights.freight_added` are non-zero on ordinary passenger flights carrying belly freight, so they cannot discriminate. `aircraft.max_passengers` describes the airframe, not the service — a freighter airframe on a positioning flight is still not a cargo service, and a passenger airframe can fly a cargo-only leg.

_Why not treat absence as an error:_ the field is not currently parsed, and older or unusual layouts may omit it. Falling back to the model default keeps import working and leaves the correction to operations.

_Trade-off:_ a genuine passenger flight planned with zero pax (a ferry or positioning flight) will import as `cargo`. Operations correct it via the patch while the flight is in `created`. The spec states the derivation is a heuristic, not authoritative.

### Status guard reuses the existing `UnprocessableError` shape

A new `InvalidStatusToChangeServiceTypeError extends UnprocessableError` in `model/error/flight.error.ts`, thrown when the flight's status is not `created`. The command loads the flight through `GetFlightQuery` on the bus (as `ChangeFlightVisibilityHandler` does), throws `FlightDoesNotExistError` when absent, then checks status before writing.

_Why:_ mirrors the eight existing `InvalidStatusTo…Error` classes and the global `DomainExceptionFilter` maps the category to `422` with the canonical `"Unprocessable Content"` reason phrase. No new error-handling machinery.

_Note on the guard's phrasing:_ the check is `status === FlightStatus.Created`, not "status is not one of the later ones". `created` is the only status preceding `ready`, so a positive check is both simpler and correct as the lifecycle grows.

### Cache invalidation follows the visibility patch

The command deletes `flightBodyCacheKeys(flightId)` after writing, exactly as `ChangeFlightVisibilityHandler` does.

_Why:_ `GET /api/v1/flight/:id` is cached. Without the eviction the patch would be invisible to the very read that verifies it — a known trap in this repo, and the reason the visibility feature test can assert the updated body immediately.

## Risks / Trade-offs

**Zero-pax passenger flights import as cargo** → Documented as a heuristic in the spec; correctable by operations while the flight is in `created` status. No silent lock-in.

**A tenth patch path is avoided, but a second convention now exists in `flights`** → The granular actions and the generic one coexist. Mitigated by scoping the generic endpoint to attributes that have no dedicated action, and by the fact that three other modules already use `@Patch(':id')` for entity edits.

**Full-body Cucumber assertions break in bulk** → `features/_helper/deep-compare.ts` matches on exact key count, so every flight-body assertion in the suite fails the moment the column exists. The task list treats sweeping `serviceType` into those bodies as one explicit step rather than discovering them one failure at a time via `failFast`.

**Freezing at `ready` may prove too strict** → If operations need to reclassify later, the guard is one condition in one command handler. Deliberately starting strict, per the requested behaviour.

**Dev database drifts from the migration** → `prisma migrate deploy` fails with `P3005` against the existing dev database. Handled in the migration plan below.

## Migration Plan

1. Edit `schema.prisma`, then `docker compose exec app npx prisma generate` — the client is emitted to `prisma/client/`, so the import path stays `prisma/client/client`.
2. `docker compose exec app npx prisma migrate dev --name add_flight_service_type` to author the migration. The `@default(passenger)` clause backfills existing rows in the same statement; there is no separate data migration and no nullable interim state.
3. Sync the dev database with `docker compose exec app npx prisma db push` (`migrate deploy` fails `P3005` here).
4. Restart the `simbrief-mock` container after editing `docker/mock/simbrief.json`; the mockserver loads fixtures at startup.
5. Restart the `app` container and let the watcher settle before running `test:functional` — a concurrent `npm run build` crashes the dev server.

**Rollback:** the change is additive. Reverting the code leaves an unused column with a valid default; dropping it needs a follow-up migration but no data recovery, since nothing else reads the value.
