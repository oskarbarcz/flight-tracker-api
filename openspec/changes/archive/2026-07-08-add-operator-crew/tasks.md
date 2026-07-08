## 1. Data model

- [x] 1.1 Add `enum CrewRole { fo, pu, fa }` to `prisma/schema.prisma`
- [x] 1.2 Add `model Crew` (`id` uuid, `name`, `email`, `operatorId` uuid, `role CrewRole`, `createdAt`) with `operator Operator @relation(fields: [operatorId], references: [id], onDelete: Cascade)`, `@@unique([operatorId, role, name])`, and `@@map("crew")` — cascade so deleting an operator disposes its ambient crew (keeps `DELETE /operator/:id` working)
- [x] 1.3 Add the `crew Crew[]` back-relation to the `Operator` model
- [x] 1.4 Run `docker compose exec app npx prisma generate` and `docker compose exec app npx prisma db push` to sync the dev DB

## 2. Crew sub-domain model + repository (operators module)

- [x] 2.1 Create `src/modules/operators/model/crew.model.ts` — `Crew` domain type + `CrewRole` enum re-export
- [x] 2.2 ~~Create `crew.error.ts`~~ — not needed: command/query reuse the existing typed `OperatorNotFoundError`; a crew-specific error would be dead code this iteration
- [x] 2.3 Create `src/modules/operators/infra/database/repository/crew.repository.ts` injecting `PrismaService`, with `upsert({ operatorId, role, name, email })` (create-or-ignore on the composite key) and `findByOperator(operatorId): Promise<Crew[]>` (ordered by role, name for deterministic assertions)

## 3. Crew import command

- [x] 3.1 Create `src/modules/operators/application/command/crew/assign-crew-to-flight.command.ts` — `AssignCrewToFlightCommand(flightId, operatorId, members: { role: CrewRole; name: string }[])` + `AssignCrewToFlightHandler`
- [x] 3.2 In the handler, resolve the operator via injected `OperatorsRepository` to obtain `shortName`
- [x] 3.3 For each member: title-case `name`, derive `email` = `${first}.${last}@${slug(shortName)}.com` lowercased, then upsert by `(operatorId, role, name)`
- [x] 3.4 Extract the CQRS dispatch into a `const command = new AssignCrewToFlightCommand(...)` before `execute(command)` at the call site

## 4. List query + read endpoint

- [x] 4.1 Create `src/modules/operators/application/query/crew/list-operator-crew.query.ts` — `ListOperatorCrewQuery(operatorId)` + handler returning `Crew[]`
- [x] 4.2 ~~Create `crew.request.ts` with `GetCrewResponse`~~ — the `Crew` model class exposes every field (no omission like rotation's `pilotId`), so it serves as the response DTO directly; an empty subclass would be redundant
- [x] 4.3 Create `src/modules/operators/infra/http/action/list-operator-crew.action.ts` — `ListOperatorCrewAction` (one HTTP action per file, `run()` method), `@Controller('/api/v1/operator/:operatorId/crew')` with `@Get()` → `ListOperatorCrewQuery`, `@UuidParam('operatorId')`, JWT-authenticated, no role gate

## 5. Register providers

- [x] 5.1 Register `CrewRepository`, `AssignCrewToFlightHandler`, `ListOperatorCrewQueryHandler` in `operators.module.ts` `providers`, and `ListOperatorCrewAction` in `controllers`

## 6. SimBrief DTO + fixtures

- [x] 6.1 Add a `Crew` type (`pilot_id`, `cpt`, `fo`, `dx`, `pu`, `fa: string[]`) to `src/core/provider/simbrief/type/simbrief.types.ts` and add optional `crew` to `OperationalFlightPlan` (handler tolerates absence)
- [x] 6.2 Add a `crew` block to all 5 entries in `docker/mock/simbrief.json` (same DLH roster; only fixture used by the import test is asserted)
- [x] 6.3 Restart the `simbrief-mock` container so the fixtures reload

## 7. Wire import into flight creation

- [x] 7.1 In `CreateFlightFromSimbriefHandler.execute`, build `members` from `ofp.crew` — `fo`, `pu`, and each `fa[]` — dropping `cpt` and `dx` (via `collectCrewMembers` helper)
- [x] 7.2 After the flight is created and the operator resolved, `await this.commandBus.execute(command)` for `AssignCrewToFlightCommand(flightId, operatorId, members)` (synchronous, before the handler returns)

## 8. Seed

- [x] 8.1 Add `prisma/seed/resource/crew.seed.ts` with a few LOT crew rows (fixed random v4 UUIDs), wired into `loadResources()` — seeded on LOT so the DLH import test stays isolated

## 9. Functional tests

- [x] 9.1 `features/operator/crew/crew.list.feature`: seed LOT crew → `GET /api/v1/operator/{operatorId}/crew` → full-body assertion (+ auth 401 / 404 / 400 cases)
- [x] 9.2 Extend the existing `features/flight/management/flight.create-with-simbrief.feature` "valid Simbrief ID" scenario: after creating the flight, `GET` the operator crew → full-body assertion of imported `fo`/`pu`/`fa` with `cpt`/`dx` absent (the single-import happy path lives with the action that triggers it)
- [x] 9.3 Duplication test in `features/operator/crew/crew.import.feature` (double POST → GET crew → same 6 rows, no duplicates) — the dedup behavior is distinct enough to warrant its own feature file
- [x] 9.4 No new step definitions needed — all scenarios reuse existing `rest-api`/`database` context steps

## 10. Verify

- [x] 10.1 `npm run lint` (0 errors) and `npm run format:fix` (source unchanged) pass
- [x] 10.2 `npm run build` passes (no type errors)
- [x] 10.3 `crew.list.feature` + `crew.import.feature` pass (7/7 scenarios); existing `flight.create-with-simbrief.feature` still passes (8/8, no regression)
