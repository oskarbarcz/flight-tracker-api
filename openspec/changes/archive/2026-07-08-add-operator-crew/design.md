## Context

SimBrief OFPs return a `crew` object (`pilot_id`, `cpt`, `fo`, `dx`, `pu`, `fa[]`), but the codebase does not model it: `OperationalFlightPlan` in `src/core/provider/simbrief/type/simbrief.types.ts` has no `crew` member, and `CreateFlightFromSimbriefHandler` writes only hardcoded crew _counts_ into `Flight.loadsheets` JSON. There is no crew table. The mock fixtures in `docker/mock/simbrief.json` also lack a `crew` block.

The operators module already hosts sub-domains that are conceptually owned by an operator — `aircraft` and `rotation` — each with its own command/query folders, repository, controller nested at `/api/v1/operator/:operatorId/...`, model, and error, all registered in `operators.module.ts`. Crew fits this exact shape. Prisma client is generated to `prisma/client/client`; every model uses UUID string ids and an `@@map` table name; FK columns follow `<name>Id String @db.Uuid` + a relation field.

## Goals / Non-Goals

**Goals:**

- Persist named, operator-owned crew imported idempotently from the SimBrief roster.
- Derive human-plausible email addresses from name + operator short name.
- Provide an operator-scoped read endpoint to list crew.
- Reuse the existing operators sub-domain conventions rather than inventing a new module.

**Non-Goals:**

- Linking crew to a specific flight (join table) — next iteration.
- A flight-scoped "pilot sees his crew" view — next iteration (builds on this endpoint).
- Populating `Flight.captainId` from the live player.
- Any authentication/identity for crew — they are ambient NPCs.

## Decisions

**Crew is a sub-domain of the operators module, not a standalone module.**
Crew are owned by an operator and mirror `aircraft`/`rotation` one-to-one (nested controller, per-operator queries). Keeping it in-module also lets `AssignCrewToFlightHandler` inject `OperatorsRepository` directly to read `shortName` for the email — no `QueryBus` hop, no cross-module dependency. _Alternative considered:_ a standalone `crew` module (the user's first instinct). Rejected because it would force a cross-module lookup for the operator and duplicate the sub-domain scaffolding operators already establishes.

**Command signature: `AssignCrewToFlightCommand(flightId, operatorId, members: { role, name }[])`.**
The SimBrief handler already resolves the operator during import, so it passes `operatorId` explicitly. _Alternative considered:_ pass only `flightId` and have the crew handler resolve the operator via a flights query — rejected because it introduces a crew→flights dependency now for a `flightId` whose purpose (the flight↔crew join) only arrives next iteration. `flightId` is carried in the signature now so it is already in place when the join lands.

**Caller flattens and filters the roster.** `CreateFlightFromSimbriefHandler` builds `members = [{role:'fo', name:fo}, {role:'pu', name:pu}, ...fa.map(n => ({role:'fa', name:n}))]`, dropping `cpt` (live player) and `dx` (dispatcher). The command receives a uniform list and stays agnostic of OFP shape. The `CrewRole` enum is therefore `{ fo, pu, fa }` only.

**Idempotency via composite unique + upsert.** `@@unique([operatorId, role, name])` lets the repository use `prisma.crew.upsert` as create-or-ignore. _Alternative considered:_ find-then-create in application code — rejected because the DB-level constraint also closes the race when two flights import concurrently.

**Email derivation.** `email = ${first}.${last}@${slug(operator.shortName)}.com`, lowercased; `first`/`last` are the first and last whitespace tokens of the title-cased name; `slug` lowercases and strips non-alphanumerics. `shortName` chosen over `icaoCode` because it matches the product example (`lufthansa`). Email carries **no** unique constraint: the same name under two roles for one operator yields two rows with the same email, which is acceptable for ambient characters.

**Synchronous import.** The SimBrief handler `await`s `commandBus.execute(new AssignCrewToFlightCommand(...))` before returning, rather than emitting an event handled asynchronously. This guarantees crew exist the moment flight creation returns, which keeps functional tests deterministic. _Alternative considered:_ an event-listener (as operators uses for flight lifecycle) — rejected for this slice on testability grounds.

**Read endpoint now.** `GET /api/v1/operator/:operatorId/crew` → `ListOperatorCrewQuery(operatorId)`, JWT-authenticated with no role gate, matching the rotations list endpoint. It provides REST-level observability for the import tests and is the base the next iteration's flight-scoped view extends.

**Crew cascade-delete with the operator.** The `Crew.operator` relation uses `onDelete: Cascade`, so deleting an operator disposes its crew. _Alternative considered:_ block deletion (as flights/aircraft do via `OperatorInUseError`) — rejected because crew are ambient, referenceless NPCs; blocking an operator delete on them would be surprising, and orphaned crew are meaningless. Without cascade, `DELETE /operator/:id` would fail on the crew FK.

## Risks / Trade-offs

- **Name-based dedup collapses distinct real people** sharing the same operator + role + name into one row → acceptable and intended; crew are ambient, and the user confirmed collisions are a non-issue.
- **Multi-token names** (3+ tokens, e.g. `MARY JO ANNE`) → `name` stores the full title-cased string, but the email uses only the first and last tokens (middle dropped). Rare in the SimBrief name pool; acceptable.
- **Command name vs. current behavior** → `AssignCrewToFlight` does not assign anything to a flight this iteration (it only creates crew). Named for its next-iteration behavior; flagged so the mismatch is intentional, not an oversight.
- **Mock/DTO must match the real SimBrief crew shape** → add the `crew` block to all 5 fixtures and restart the SimBrief mock, or the import path is never exercised in dev/tests.
- **Added latency on flight creation** → up to ~24 sequential upserts per import; negligible, and the synchronous guarantee is worth it.

## Migration Plan

1. Add `Crew` model + `CrewRole` enum + `Operator.crew` back-relation to `schema.prisma`; run `prisma db push` on dev (project convention — `migrate deploy` fails P3005 on the dev DB).
2. Add the `crew` block to the 5 entries in `docker/mock/simbrief.json`; restart the `simbrief-mock` container so fixtures reload.
3. Add a `crew` resource seed with fixed v4 UUIDs for the seed-based read test.
4. No rollback concern: the feature is additive; no existing data is migrated or removed.

## Open Questions

- None blocking. The read endpoint's role gating is resolved as JWT-only (consistent with the rotations list); if crew should later be operations-only, that is a one-line `@Role` addition.
