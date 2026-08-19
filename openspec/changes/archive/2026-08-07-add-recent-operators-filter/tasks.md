## 1. Request contract

- [x] 1.1 Add `OperatorListFilters` to `src/modules/operators/infra/http/request/operator.request.ts` with a single optional property `recentOnly?: boolean`, validated as a strict boolean (`true`/`false` only, no lenient coercion) and transformed from the query string
- [x] 1.2 Verify that `?recentOnly=maybe` and a valueless `?recentOnly` both produce a `400` with a violation naming `recentOnly`, and that omitting the parameter leaves it `undefined` rather than defaulting to `false` in a way that changes the branch
- [x] 1.3 Document the parameter on `ListOperatorsAction` with `@ApiQuery`, describing that it returns at most four operators the caller most recently flew

## 2. Recency aggregation

- [x] 2.1 Add `findRecentlyInvolvedWith(userId, limit)` to `OperatorsRepository`, next to the existing `countFlights`, using `prisma.flight.groupBy` over `operatorId` with `where: { OR: [{ captainId }, { createdById }] }`, `_max: { createdAt: true }`, ordered by `_max.createdAt` descending then `operatorId` ascending, taking `limit`
- [x] 2.2 Hydrate the ranked operator ids into full operator bodies and re-apply the ranking order explicitly — `findMany({ where: { id: { in: ids } } })` does not preserve `in` order
- [x] 2.3 Apply the ICAO-code-ascending tie-break when reordering, since Prisma cannot order the `groupBy` by a non-grouped column
- [x] 2.4 Map the hydrated rows through the same casts `findAll` uses (`type`, `continent`, `alliance`, `group`, `fleetTypes`, `hubs`) so the two variants return byte-identical operator bodies
- [x] 2.5 Confirm the generated SQL uses an index rather than a sequential scan

## 3. Query handler and action wiring

- [x] 3.1 Add `ListRecentOperatorsQuery` under `src/modules/operators/application/query/`, carrying the user id and returning `Operator[]`, with the limit of four as a module-level constant
- [x] 3.2 Register the handler in `operators.module.ts` providers — it is not auto-discovered
- [x] 3.3 Extend `ListOperatorsAction` to accept `@Query() filters: OperatorListFilters` and branch to the new query when `recentOnly` is `true`, assigning the query to a `const` before `execute` per the repository convention
- [x] 3.4 Read the caller's id from the authorized request the same way `UserAwareCacheInterceptor` does (`req.user.sub`)
- [x] 3.5 Keep the unfiltered branch dispatching `ListAllOperatorsQuery` unchanged

## 4. Caching

- [x] 4.1 Add `OPERATORS_LIST_RECENT` to `CACHE_KEYS` and a TTL constant of the same magnitude as `CACHE_TTL_MS.USER_ME` (60s)
- [x] 4.2 Add a cache interceptor in `src/core/cache/` extending `CacheInterceptor` (not `UserAwareCacheInterceptor`, which would fragment the shared default entry per user) whose `trackBy` returns `operators:list` when the filter is absent or false, and `user:<sub>:operators:list:recent` when it is true
- [x] 4.3 Swap `ListOperatorsAction` from `CacheInterceptor` to the new interceptor, keeping `@CacheKey(CACHE_KEYS.OPERATORS_LIST)` as the base key so the default branch's entry is unchanged
- [x] 4.4 Verify by inspection that no request path can produce the same key for both variants
- [x] 4.5 Apply the TTL to the per-user entry only; the shared default entry keeps its current untimed behaviour
- [x] 4.6 Make the interceptor decline to cache any request whose query is not exactly an absent/`true`/`false` `recentOnly`, so that interceptor-before-pipe ordering cannot answer an invalid query from the cache instead of rejecting it

## 5. Invalidation

- [x] 5.1 Add a listener under `src/modules/operators/application/event/external/` on `FlightEventType.FlightWasCreated` and `FlightEventType.PilotCheckedIn`, deleting the recent-list key of the event's `actorId` — both payloads already carry it, so no bus query is needed
- [x] 5.2 Return early without a cache delete when the event carries no actor
- [x] 5.3 Register the listener in `operators.module.ts` providers
- [x] 5.4 Leave `OperatorCacheListener` untouched — the shared list's invalidation is unchanged

## 6. Flight creator

- [x] 6.0a Add nullable `createdById` to `Flight` in `schema.prisma` with a `"FlightCreatedBy"` relation to `User`, mirroring the existing `Rotation.createdById` naming, plus `@@index([captainId, createdAt])` and `@@index([createdById, createdAt])`
- [x] 6.0b Write the migration: add the column and foreign key, create both indexes, and backfill `createdById` from `flight_event` rows of type `flight.created` that name an actor
- [x] 6.0c Persist the creator in `FlightsRepository.create`, and pass `initiatorId` from both `CreateFlightCommand` and `CreateFlightFromSimbriefCommand` (both already carry it)
- [x] 6.0d Mirror the migration's backfill in the seed, so seeded flights get their creator from their own creation events rather than needing 25 literal edits

## 7. Seed data

- [x] 7.1 Confirm the baseline: `operations@example.com` already created 20 seeded flights (15 `AAL`, 5 `DLH`), `cabin-crew@example.com` captains flights for `AAL` and `DLH`, and admin has neither. That covers the fewer-than-four and empty-list cases without any new fixture
- [x] 7.2 Add three operators (`AFR`, `ICE`, `KLM`) with one aircraft each, so operations reaches five involved carriers and the four-item cap truncates a real fixture. `LOT` and `BAW` must stay dependency-free for `operator.delete.feature`, and both Condor aircraft are pinned — one asserted at zero flights, the other deleted by `aircraft.delete.feature` — so no existing operator can take the extra flights
- [x] 7.3 Seed the three new flights as `Created`, captain-less, `createdById` operations, each with its own `FlightWasCreated` event so the backfill and the live path agree
- [x] 7.4 Give two of the new flights an identical `createdAt` so the ICAO tie-break is covered by a real fixture, and keep the fourth and fifth ranked carriers strictly apart so the cap boundary stays deterministic
- [x] 7.5 Use freshly generated v4 UUIDs for the new operator, aircraft, flight and event ids
- [x] 7.6 Set the three new aircraft to `planned`, consistent with owning a `Created` flight
- [x] 7.7 Update the counts the new flights move: `features/flight/management/flight.list.feature` totals 25 to 28 and upcoming 6 to 9

## 8. Unit tests

- [x] 8.1 Add colocated `*.spec.ts` files covering: single carrier, repeated involvement collapsing to one entry, the four-item cap, fewer than four, none, and the ICAO tie-break — with fixtures inline
- [x] 8.2 Assert the aggregation is scoped to `captainId OR createdById`, and that it carries no `completedAt` predicate
- [x] 9.3 Assert the hydration step reorders correctly when the repository returns operators in an order different from the ranking

## 9. Functional tests

- [x] 9.1 Add `features/operator/operator.list-recent.feature` as its own file — this is a distinct behaviour, not a side effect of the existing list action, so `operator.list.feature` stays untouched
- [x] 9.2 Cover the RBAC matrix: operations `200` with four carriers (dispatched), cabin crew `200` with two (flown), admin `200` with an empty list, unauthenticated `401`
- [x] 9.3 Assert full operator bodies with the complete key set — the deep-compare helper matches exact keys, not a subset
- [x] 9.4 Add a scenario asserting `?recentOnly=false` returns the same body as no parameter, and scenarios for the two `400` cases
- [x] 9.5 Order the scenarios so cached reads precede anything that mutates operators or completes flights, since the database reset step does not flush the cache between scenarios
- [x] 9.6 Add a scenario proving cross-variant cache isolation: read the filtered list, then the unfiltered list, and assert the second is the full list

## 10. Verification

- [x] 10.1 `docker compose exec app npm run lint` and `format:fix`, reverting the three feature files repo-wide Prettier is known to churn
- [x] 10.2 `docker compose exec app npm test`
- [x] 10.3 `docker compose exec app npx cucumber-js features/operator/` — restart the app container first if a build ran while `start:dev` was watching
- [x] 10.4 Run the statistics and flight features to confirm the new seed flights and the `createdById` column broke nothing
- [x] 10.5 `openspec validate add-recent-operators-filter --strict`
