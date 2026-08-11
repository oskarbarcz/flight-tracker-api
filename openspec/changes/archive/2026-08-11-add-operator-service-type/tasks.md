## 1. Schema and generated client

- [x] 1.1 Add `enum OperatorServiceType { passenger cargo both }` to `prisma/schema.prisma`, placed next to `OperatorType`, with no `@@map`.
- [x] 1.2 Add `serviceType OperatorServiceType @default(passenger)` to `model Operator` in `prisma/schema.prisma`, between `type` and `hubs`.
- [x] 1.3 Author `prisma/migrations/20260811120000_add_operator_service_type/migration.sql` by hand — `CREATE TYPE "OperatorServiceType"` plus `ALTER TABLE "operator" ADD COLUMN "serviceType" "OperatorServiceType" NOT NULL DEFAULT 'passenger'`.
- [x] 1.4 Apply that SQL to the dev database with `docker compose exec -T database psql -U user -d app -v ON_ERROR_STOP=1 -f -`, rather than `prisma db push`, which would drop unrelated drift in the local database.
- [x] 1.5 Run `docker compose exec app npx prisma generate` and confirm `OperatorServiceType` is exported from `prisma/client/client`.

## 2. Domain model and DTOs

- [x] 2.1 Add `export enum OperatorServiceType { Passenger = 'passenger', Cargo = 'cargo', Both = 'both' }` to `src/modules/operators/model/operator.model.ts`, mirroring the Prisma enum's shape without importing from `prisma/client/*`.
- [x] 2.2 Add the `serviceType` property to the `Operator` class with `@ApiProperty({ enum: OperatorServiceType, example: OperatorServiceType.Passenger, default: OperatorServiceType.Passenger, required: false })`, `@IsNotEmpty()`, and `@IsEnum(OperatorServiceType)` — following how `type` is declared, and placed directly after it.
- [x] 2.3 Add `serviceType: OperatorServiceType = OperatorServiceType.Passenger` to `CreateOperatorRequest` in `src/modules/operators/infra/http/request/operator.request.ts`, alongside the existing `type`, `hubs`, `continent`, and `avgFleetAge` defaults.
- [x] 2.4 Confirm `UpdateOperatorRequest` inherits the field as optional through `PartialType`, so no change is needed there.
- [x] 2.5 Confirm `LegacyOperatorResponse` is unaffected — it is a `PickType` of six identity fields and must not gain `serviceType`.

## 3. Persistence

- [x] 3.1 Add `serviceType: operator.serviceType as OperatorServiceType` to `toDomain` in `src/modules/operators/infra/database/repository/operators.repository.ts`, alongside the existing `type` / `continent` / `alliance` / `group` casts.
- [x] 3.2 Confirm `create` and `update` in the repository persist the field without change — both spread the request DTO into the Prisma call.
- [x] 3.3 Confirm no new action, command, query, or `operators.module.ts` registration is needed, since the generic create and patch paths already carry the field.

## 4. Seed data

- [x] 4.1 Import `OperatorServiceType` from `prisma/client/client` in `prisma/seed/resource/operators.seed.ts`.
- [x] 4.2 Seed Lufthansa, American Airlines, British Airways, Air France, and KLM as `both`, and Condor, LOT, and Icelandair as `passenger`.
- [x] 4.3 Leave `cargo` unseeded — none of the eight seeded carriers is a pure freighter — and cover that value through the create and update feature scenarios instead.

## 5. Functional tests

- [x] 5.1 Add `"serviceType"` to every full operator-body assertion across the suite — 40 occurrences in 8 files: the five `features/operator/` features plus `aircraft.create`, `aircraft.update`, and `aircraft.delete`, which re-read the operator to verify a fleet-size side effect. Use each seeded operator's actual value.
- [x] 5.2 Extend the "create operator with additional fields" scenario in `features/operator/operator.create.feature` to send `"serviceType": "cargo"` and assert it in the response, covering the value that has no seed fixture.
- [x] 5.3 Confirm the plain create scenario in the same feature asserts `serviceType` as `passenger`, proving the documented default.
- [x] 5.4 Add a scenario to `features/operator/operator.update.feature` patching Condor's `serviceType` to `cargo` and asserting the full returned body, followed by `I set database to initial state`.
- [x] 5.5 Statically reconcile the edited assertions against the seed values before running the suite, and confirm every JSON block still parses.

## 6. Unit tests

- [x] 6.1 Add `serviceType: OperatorServiceType.Passenger` to the `operatorRow` fixture in `src/modules/operators/infra/database/repository/operators.repository.spec.ts`, keeping the "full operator bodies" assertion honest.

## 7. Verification

- [x] 7.1 `docker compose exec app npm run lint`.
- [x] 7.2 `docker compose exec app npm test` — 173 tests pass.
- [x] 7.3 Restart the `app` container, let the watcher settle, then `docker compose exec app npm run test:functional` — 959 scenarios pass.
- [x] 7.4 Run Prettier over the touched paths only, not repo-wide, to avoid churning the three unrelated `.feature` files. The Prisma plugin realigns the whole `Operator` model block.
