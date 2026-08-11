## 1. Domain rule

- [x] 1.1 Add `serviceTypesCarrying(traffic: OperatorServiceType): OperatorServiceType[]` to `src/modules/operators/model/operator.model.ts`, returning `[both]` for `both` and `[traffic, both]` otherwise.
- [x] 1.2 Add `src/modules/operators/model/operator.model.spec.ts` covering all three inputs.

## 2. Request contract

- [x] 2.1 Add `serviceType?: OperatorServiceType` to `OperatorListFilters` in `src/modules/operators/infra/http/request/operator.request.ts`, with `@IsOptional()` and `@IsEnum(OperatorServiceType)`, declared as a plain identifier like the sibling `recentOnly`.
- [x] 2.2 Add an `@ApiQuery` for `serviceType` to `ListOperatorsAction`, declaring the enum and stating in the description that carriers of both are returned for `passenger` and for `cargo`.
- [x] 2.3 Read the parameter once in `ListOperatorsAction.findAll` and pass it into whichever query the `recentOnly` branch selects, so neither filter ignores the other.

## 3. Queries

- [x] 3.1 Give `ListAllOperatorsQuery` an optional `serviceType` constructor argument and forward it from the handler to `repository.findAll`.
- [x] 3.2 Give `ListRecentOperatorsQuery` an optional `serviceType` second argument and forward it from the handler to `repository.findRecentlyInvolvedWith` as its third argument.
- [x] 3.3 Update `list-recent-operators.query.spec.ts` for the new argument, and add a case asserting a requested traffic kind reaches the repository.

## 4. Persistence

- [x] 4.1 Add a private `carryingFilter(serviceType?)` to `OperatorsRepository` returning a `Prisma.OperatorWhereInput` built from `serviceTypesCarrying`, or `undefined` when no traffic kind is requested.
- [x] 4.2 Apply it as the `where` of `findAll`.
- [x] 4.3 Apply it as a relation filter inside the `flight.groupBy` `where` of `findRecentlyInvolvedWith`, so the narrowing happens before `take: limit` rather than after. Leave the operator hydration step unfiltered — the ranking it hydrates already matches.
- [x] 4.4 Extend `operators.repository.spec.ts`: the filter reaches the `groupBy` `where` alongside `take`, the aggregation is unfiltered when no traffic kind is asked for, and `findAll` passes the expanded membership list (and `undefined` when unfiltered).

## 5. Caching

- [x] 5.1 Confirm `OperatorListCacheInterceptor` needs no change — `isCacheableRequest` already returns false for any query parameter other than `recentOnly`, so filtered requests bypass the cache, cannot collide with `operators:list` or the per-user recent key, and always reach request validation.

## 6. Seed data

- [x] 6.1 Append Cargolux (`CLX` / `CV`, callsign `CARGOLUX`, hub `LUX`, `serviceType: cargo`, no fleet, no alliance or group) to `prisma/seed/resource/operators.seed.ts` with a freshly generated v4 UUID, so `cargo` and `both` select different sets.
- [x] 6.2 Append rather than insert, so the existing unfiltered-list assertions keep their order — the list has no `ORDER BY` and returns physical order.
- [x] 6.3 Add the new carrier to the three existing full-list assertions: one in `operator.list.feature` and two in `operator.list-recent.feature`.

## 7. Functional tests

- [x] 7.1 Add `features/operator/operator.list-by-service-type.feature` with full-body assertions for `cargo` (6 carriers), `passenger` (8), and `both` (5), lifted from the unfiltered list so the bodies cannot drift.
- [x] 7.2 Add the RBAC matrix: operations and cabin crew get `200`, unauthenticated gets `401` with the canonical error body.
- [x] 7.3 Add the `400` scenario for an unsupported value, asserting the `violations` map names `serviceType` and lists the accepted values.
- [x] 7.4 Add the composition scenario: the operations user's recent carriers filtered to `cargo` return `KLM, AFR, DLH, AAL` — `ICE` drops out and `AAL`, ranked fifth unfiltered, fills the cap. The expected body is only correct under narrow-then-cap.
- [x] 7.5 Reconcile every expected body against the seed before running the suite, and confirm each JSON block parses.

## 8. Verification

- [x] 8.1 `docker compose exec app npm run lint`.
- [x] 8.2 `docker compose exec app npx jest src/modules/operators` — 21 tests pass.
- [x] 8.3 Reseed, restart the `app` container, then probe the running API for all three values, the invalid value, and the `recentOnly` combination, confirming the predicted sets and the exact violation message before committing to the suite.
- [x] 8.4 `docker compose exec app npm run test:functional` — 967 scenarios pass.
- [x] 8.5 Run Prettier over the touched paths only, not repo-wide.
