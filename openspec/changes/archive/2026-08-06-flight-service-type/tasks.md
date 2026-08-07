## 1. Schema and generated client

- [x] 1.1 Add `enum FlightServiceType { passenger cargo }` to `prisma/schema.prisma`, placed next to `FlightSource` / `FlightTracking`, with no `@@map`.
- [x] 1.2 Add `serviceType FlightServiceType @default(passenger)` to `model Flight` in `prisma/schema.prisma`.
- [x] 1.3 Run `docker compose exec app npx prisma generate` and confirm `FlightServiceType` is exported from `prisma/client/client`.
- [x] 1.4 Author the migration with `docker compose exec app npx prisma migrate dev --name add_flight_service_type`, then sync the dev database with `docker compose exec app npx prisma db push`.

## 2. Domain model and DTOs

- [x] 2.1 Add `export enum FlightServiceType { Passenger = 'passenger', Cargo = 'cargo' }` to `src/modules/flights/model/flight.model.ts`, mirroring the Prisma enum's shape without importing from `prisma/client/*`.
- [x] 2.2 Add the `serviceType` property to the `Flight` class in `flight.model.ts` with `@ApiProperty({ enum: FlightServiceType, example: FlightServiceType.Passenger })`, `@IsEnum(FlightServiceType)`, and a `FlightServiceType.Passenger` default — following how `tracking` is declared.
- [x] 2.3 Add `InvalidStatusToChangeServiceTypeError extends UnprocessableError` to `src/modules/flights/model/error/flight.error.ts`, matching the existing `InvalidStatusTo…Error` classes, with a message stating the service type can only be changed before the flight is marked as ready.
- [x] 2.4 Add `export class UpdateFlightRequest` to `src/modules/flights/infra/http/request/flight.dto.ts` as a `PartialType(PickType(Flight, ['serviceType']))` so the field is optional and an empty body validates.
- [x] 2.5 Verify `CreateFlightRequest` inherits `serviceType` from `Flight` (it is not in the `OmitType` list) and that omitting it in a create request falls back to `passenger`.

## 3. Persistence and read models

- [x] 3.1 Add `updateServiceType(id, serviceType)` to `src/modules/flights/infra/database/repository/flights.repository.ts`, following `updateVisibility`.
- [x] 3.2 Confirm `createFlight` in the repository persists `serviceType` when present; add it to the create payload if the row is built field-by-field rather than spread.
- [x] 3.3 Add `serviceType: flight.serviceType as FlightServiceType` to the returned object in `src/modules/flights/application/query/get-flight.query.ts`, alongside the existing `source` / `tracking` casts.
- [x] 3.4 Add the same cast to `src/modules/flights/application/query/list-all-flights.query.ts`.

## 4. Update command and action

- [x] 4.1 Create `src/modules/flights/application/command/update-flight.command.ts` with `UpdateFlightCommand(flightId, serviceType?)` and its handler: load the flight via `GetFlightQuery` on the query bus, throw `FlightDoesNotExistError` when absent, throw `InvalidStatusToChangeServiceTypeError` unless `status === FlightStatus.Created`, then call `updateServiceType`. Return early as a no-op when no supported field is present.
- [x] 4.2 Evict the flight body cache in the handler with `flightBodyCacheKeys(flightId)` after a successful write, as `ChangeFlightVisibilityHandler` does.
- [x] 4.3 Create `src/modules/flights/infra/http/action/flight/update-flight.action.ts` — `@Patch(':id')` on `@Controller('api/v1/flight')`, `@Role(UserRole.Operations)`, `@HttpCode(HttpStatus.NO_CONTENT)`, `@UuidParam('id')`, body `UpdateFlightRequest`. Assign `const command = new UpdateFlightCommand(...)` before `commandBus.execute(command)`.
- [x] 4.4 Add the Swagger decorators the sibling patch actions carry: `@ApiTags('flight')`, `@ApiBearerAuth('jwt')`, `@ApiOperation`, `@ApiParam`, `@ApiBody`, `@ApiNoContentResponse`, and the bad-request / unauthorized / forbidden / not-found / unprocessable response types.
- [x] 4.5 Register `UpdateFlightAction` in `controllers` and `UpdateFlightHandler` in `providers` in `src/modules/flights/flights.module.ts`.

## 5. SimBrief derivation

- [x] 5.1 No provider type change needed — the derivation reads `weights.pax_count`, already declared on the `Weights` type in `src/core/provider/simbrief/type/simbrief.types.ts`.
- [x] 5.2 In `src/modules/flights/application/command/create-flight-from-simbrief.command.ts`, set `serviceType` on the built `flightData`: `cargo` when `ofp.weights.pax_count` parses to `0`, `passenger` otherwise and when the value is absent, blank, or non-numeric.
- [x] 5.3 No fixture change needed — all five `docker/mock/simbrief.json` entries already report `weights.pax_count` of `348`.

## 6. Seed data

- [x] 6.1 Add `serviceType: FlightServiceType.Cargo` to one seeded flight in `prisma/seed/resource/flights.seed.ts` that is in status, and note the choice in that flight's header comment block alongside its existing `status:` line. Leave every other seeded flight on the `passenger` default.
- [x] 6.2 Confirm one seeded flight in `created` status remains `passenger` so the patch happy path and the frozen-status rejection both have a target, and identify a flight past `created` for the `422` scenario.
- [x] 6.3 Run `docker compose exec app npm run database:seed` and confirm it completes.

## 7. Functional tests

- [x] 7.1 Create `features/flight/management/flight.update.feature` covering the new endpoint: operations changes `serviceType` to `cargo` on a `created` flight (204, then a full-body `GET` assertion), the `422` rejection on a flight past `created`, the `400` for an unsupported enum value with the `violations` map, the `204` no-op for an empty body, the `404` for an unknown id, and the `400` for a malformed uuid.
- [x] 7.2 Add the RBAC matrix to that feature: admin `403`, cabin crew `403`, unauthenticated `401`, each with the canonical error body.
- [x] 7.3 Add a scenario to `features/flight/management/flight.create.feature` asserting a flight created without `serviceType` comes back as `passenger`, and one creating a flight with `serviceType: "cargo"`.
- [x] 7.4 Add `"serviceType"` to the full flight-body assertions across the suite — 37 occurrences in 24 files, locatable with `grep -rl hasFlightPath features/`. Use the seeded flight's actual value in each, `passenger` for all but the flight seeded as cargo in 6.1.
- [x] 7.5 Assert the SimBrief derivation in `features/flight/management/flight.create-with-simbrief.feature` — with a non-zero `pax_count` in the fixture the imported flight is `passenger`.
- [x] 7.6 Statically reconcile the new and edited scenarios against the seed and the cache-eviction behaviour before running the suite; place cached reads ahead of mutators within a feature.

## 8. Unit tests

- [x] 8.1 Add `src/modules/flights/application/command/update-flight.command.spec.ts` — happy path calls `updateServiceType` and evicts the cache, non-`created` status throws `InvalidStatusToChangeServiceTypeError`, missing flight throws `FlightDoesNotExistError`, empty payload writes nothing.
- [x] 8.2 Add coverage for the SimBrief derivation: zero passengers yields `cargo`, non-zero yields `passenger`, absent field yields `passenger`.

## 9. Verification

- [x] 9.1 `docker compose exec app npm run lint:fix` and `docker compose exec app npm run format:fix`, reverting the three unrelated `.feature` files Prettier churns.
- [x] 9.2 `docker compose exec app npm test`.
- [x] 9.3 Restart the `app` container, let the watcher settle, then `docker compose exec app npm run test:functional`. The `report-on-block` `hasFlightPath` flake is pre-existing and not a regression.
- [x] 9.4 Check `/api` in Swagger: `serviceType` appears on the flight schema and `PATCH /api/v1/flight/{id}` is documented.
