## Why

The `operator-service-type` capability exposes what each operator carries but offers no way to select on it, and it deliberately deferred filtering as a non-goal. It also put the interesting part of the semantics on the client: "a consumer selecting freight carriers MUST match operators classified as `cargo` or `both`". Every consumer that wants freight carriers therefore fetches the whole operator list and reimplements that membership rule, and each one can get it wrong in its own way. Moving the selection server-side turns a documented client obligation into behaviour the API guarantees.

## What Changes

- Add an optional `serviceType` query parameter to `GET /api/v1/operator`, accepting `passenger`, `cargo`, or `both`. An unsupported value is rejected with `400`; omitting it returns the unfiltered list exactly as before.
- Implement the filter as traffic-category membership, not exact value matching: `serviceType=cargo` returns operators classified `cargo` **or** `both`, `serviceType=passenger` returns `passenger` **or** `both`, and `serviceType=both` returns only operators classified `both`. This is the rule the capability already required consumers to apply, now applied by the system.
- Compose the filter with the existing `recentOnly=true` filter rather than letting one silently ignore the other. The traffic filter is applied inside the aggregation, before the four-carrier cap, so the cap counts only matching carriers — asking for a caller's recent freight carriers can surface a carrier that the unfiltered recent list pushed off the end.
- Serve traffic-filtered lists uncached. The existing list cache interceptor already declines to cache any request carrying a query parameter other than `recentOnly`, so a filtered request always reads current data and always reaches request validation.
- Seed a pure freight carrier, Cargolux, so all three filter values select genuinely different sets. The eight carriers seeded up to now were `passenger` or `both` only, which left `cargo` and `both` returning the same list.

## Capabilities

### Modified Capabilities

- `operator-service-type`: the traffic-category membership rule becomes system behaviour rather than a consumer obligation, and the capability gains the list filter, its composition with the recent-carriers filter, and its caching contract.

## Impact

**Database** — none. No schema change; the filter reads the existing `serviceType` column. No index is added: the operator table is small and the query plan is a sequential scan either way.

**API** — one new optional query parameter on `GET /api/v1/operator`, documented in Swagger with its enum. Additive: existing callers see no change in behaviour or response shape.

**Code** — `src/modules/operators/`: `model/operator.model.ts` (the `serviceTypesCarrying` membership helper), `infra/http/request/operator.request.ts` (`OperatorListFilters` gains the validated parameter), both list queries (`list-all-operators.query.ts`, `list-recent-operators.query.ts`) forward the value, `infra/database/repository/operators.repository.ts` applies it to `findAll` and to the recent-carrier aggregation, and `infra/http/action/operator/list-operators.action.ts` reads it and documents it. No new action, command, or module registration.

**Caching** — no change to `src/core/cache/operator-list-cache.interceptor.ts`. Its existing rule — decline to cache when any query parameter other than `recentOnly` is present — already gives filtered requests the intended pass-through behaviour, and keeps them from colliding with the shared list key or the per-user recent key.

**Tests** — a new Cucumber feature for the filter, covering the three values, the membership rule, the invalid value, the RBAC matrix, and the composition with `recentOnly`. The new seeded carrier has to be absorbed by the three existing unfiltered-list assertions. Unit tests for the membership helper and for the filter reaching both repository queries.
