## Why

A flight record carries no indication of whether it operates as a passenger service or a cargo service. Consumers (pilot card, tracking views, flight lists) cannot label or filter freight operations, and operations teams have no way to record the distinction when they plan a flight. The value is descriptive metadata that clients need today; the backend derives no behaviour from it.

## What Changes

- Add a `serviceType` attribute to the flight domain model with values `passenger` and `cargo`, defaulting to `passenger`. Every existing flight becomes `passenger`.
- Expose `serviceType` in every flight read payload. All of them share one response class (`GetFlightResponse`), so `GET /api/v1/flight/:id`, `GET /api/v1/flight`, `POST /api/v1/flight`, `POST /api/v1/flight/simbrief`, and the runway/parking-position patches that return the flight all pick it up together. The websocket gateway emits flight _events_, not flight bodies, so it is unaffected.
- Add a general-purpose `PATCH /api/v1/flight/:id` endpoint, `operations`-only, accepting a partial body whose sole field for now is `serviceType`. This is a deliberate departure from the existing granular per-attribute patch actions (`PATCH /:id/tracking`, `/:id/departure-runway`, …) so that future editable flight attributes have a home.
- Restrict the mutation to flights still in `created` status. Once operations mark a flight as `ready`, the service type is frozen and the endpoint answers `422`.
- Derive `serviceType` on SimBrief import: a flight is `cargo` when the OFP reports no passengers, `passenger` otherwise. SimBrief exposes no explicit cargo/freighter flag, so this is a heuristic and operations can correct it via the new PATCH while the flight is still `created`.
- No cargo-specific backend behaviour: loadsheets, crew rules, timesheets, statistics, delay handling, and lifecycle transitions are untouched.

## Capabilities

### New Capabilities

- `flight-service-type`: classification of a flight as a passenger or cargo service — the default on creation, how it is derived from a SimBrief OFP, how it is exposed in flight read models, and the operations-only, `created`-status-only mutation that changes it.

### Modified Capabilities

None. No existing spec in `openspec/specs/` describes flight creation, flight read models, or flight lifecycle status transitions, so there are no requirements to amend.

## Impact

**Database** — `prisma/schema.prisma`: new `FlightServiceType` enum (`passenger`, `cargo`) plus a `serviceType` column on `model Flight` defaulting to `passenger`. Requires a migration and a `prisma generate`; the dev database also needs `prisma db push`.

**API** — one new endpoint (`PATCH /api/v1/flight/:id`) and one new field on the flight read model. Additive only, no breaking change for clients. Swagger picks both up from the decorated model.

**Code** — `src/modules/flights/`: `model/flight.model.ts` (enum + `Flight` property), `model/error/flight.error.ts` (new `UnprocessableError` for the status guard), `infra/http/request/flight.dto.ts` (request DTO; `CreateFlightRequest` inherits the field), a new action under `infra/http/action/flight/`, a new command under `application/command/`, a repository update method, the `flights.module.ts` registration, and the SimBrief derivation in `application/command/create-flight-from-simbrief.command.ts`.

**External providers** — none. The derivation reads `weights.pax_count`, which `src/core/provider/simbrief/type/simbrief.types.ts` already declares and the `simbrief-mock` fixture in `docker/mock/simbrief.json` already supplies.

**Tests** — new Cucumber feature for the PATCH endpoint (including the RBAC matrix and the post-`ready` rejection), plus full-body assertions in the existing flight get/list/create/create-with-simbrief features that must absorb the new key. Seed data in `prisma/seed/resource/flights.seed.ts` needs at least one cargo flight.
