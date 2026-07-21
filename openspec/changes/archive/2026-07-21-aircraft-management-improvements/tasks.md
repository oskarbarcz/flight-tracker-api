## 1. Data model (SELCAL)

- [x] 1.1 In `prisma/schema.prisma`, change `Aircraft.selcal` from `String` to `String?`
- [x] 1.2 Generate the migration and apply it to the dev DB (`docker compose exec app npx prisma db push`), then regenerate the client (`npx prisma generate`)

## 2. API contract

- [x] 2.1 In `src/modules/operators/infra/http/request/aircraft.request.ts`, make `CreateAircraftRequest.selcal` optional: remove `@IsNotEmpty()`, add `@IsOptional()`, `@ApiProperty({ nullable: true, required: false })`, type `selcal?: string | null`
- [x] 2.2 In the same file, add a REQUIRED `baseAirportId!: string` to `CreateAircraftRequest` with `@IsUUID()` (no `@IsOptional()`); `UpdateAircraftRequest` inherits it as optional via `PartialType`
- [x] 2.3 In `src/modules/operators/model/aircraft.model.ts`, remove `@IsNotEmpty()` from `selcal`, set `@ApiProperty({ nullable: true })`, type `selcal!: string | null`
- [x] 2.4 Confirm query handlers + `flights.repository` aircraft expansion compile with the nullable `selcal`

## 3. Base-airport existence check (dedicated assert query)

- [x] 3.1 Add `AssertAirportExistsQuery` + `AssertAirportExistsHandler` under `src/modules/airports/application/assert/` (mirrors `assert-rotation-exists.query`); throws `AirportNotFoundError`. Register the handler in `airports.module.ts`
- [x] 3.2 Switch `AirportsRepository.exists()` from `findOneBy` (full select incl. `shape`) to a lightweight `count` — a strict win for all existing callers
- [x] 3.3 In `create-aircraft.command.ts`, inject `QueryBus` and always assert the (required) `baseAirportId` via `AssertAirportExistsQuery` before `repository.create`
- [x] 3.4 In `update-aircraft.command.ts`, inject `QueryBus` and assert `baseAirportId` via `AssertAirportExistsQuery` only when present, after operator/aircraft checks

## 4. Creation initialises last airport

- [x] 4.1 In `aircraft.repository.ts` `create`, set `lastAirportId: data.baseAirportId` alongside the `{ id, ...data, operatorId }` spread (leave `lastAirportUpdatedAt` null)

## 5. Seed

- [x] 5.1 In `prisma/seed/resource/aircrafts.seed.ts`, set the a319 fixture's `selcal` to `null` (`mk` unchanged), keeping all other SELCAL values

## 6. Functional tests

- [x] 6.1 `aircraft.create.feature`: every create body now carries `baseAirportId`; 201 responses assert `baseAirport` and `lastAirport` both resolve to the base; SELCAL-optional create still 201 with `selcal: null`; unknown base → 404; the "incorrect data" 400 now lists the missing `baseAirportId` violation
- [x] 6.2 `aircraft.update.feature`: change base airport, clear it with `null`, unknown base → 404
- [x] 6.3 `aircraft.get.feature`: GET the seeded null-`selcal` aircraft (a319, Condor) asserting `"selcal": null`

## 7. Livery optional with default

- [x] 7.1 In `aircraft.request.ts`, make `CreateAircraftRequest.livery` optional (`@IsOptional()` in front of `@IsString() @IsNotEmpty()`, `required: false`, type `livery?: string`); document the default in `@ApiProperty`
- [x] 7.2 In `create-aircraft.command.ts`, fetch the operator via `operatorsRepository.findOneBy({ id })` (for `shortName`) and resolve `data.livery ?? \`${operator.shortName} ${new Date().getFullYear()}\``; pass the resolved payload to `create`
- [x] 7.3 Tighten `AircraftRepository.create` param to `CreateAircraftRequest & { livery: string }`
- [x] 7.4 Add a `@defaultLivery('<shortName>')` matcher to `features/_helper/deep-compare.ts`; add an `aircraft.create.feature` scenario for omitted livery asserting `@defaultLivery('Lufthansa')`

## 8. Verify

- [x] 8.1 `docker compose exec app npm run lint` (+ `format:fix`) and typecheck (`tsc --noEmit`) — pass
- [x] 8.2 `features/operator/aircraft` 54/54 (incl. default-livery) — pass; `features/airport` 181/181 and `flight.get` 7/7 verified in the prior round (unaffected this round)
- [x] 8.3 `openspec validate aircraft-management-improvements --strict` — valid
