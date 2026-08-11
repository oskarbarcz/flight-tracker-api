## Context

See `proposal.md` § Why for motivation and `specs/operator-service-type/spec.md` for the behaviour contract. This change reverses one non-goal of the archived `add-operator-service-type` change ("Filtering or sorting the operator list by service type") and leaves its other non-goals standing.

Three pieces of current state shape the approach:

**The operator list already carries one filter.** `ListOperatorsAction` takes an `OperatorListFilters` query DTO whose only member is `recentOnly`, and branches between `ListAllOperatorsQuery` and `ListRecentOperatorsQuery`. That camelCase parameter name — identical on the wire and as a TypeScript property — and the branch are the pattern a second filter has to fit.

**The recent-carrier query aggregates over flights, not operators.** `findRecentlyInvolvedWith` runs `flight.groupBy({ by: ['operatorId'], where: { OR: [captain, creator] }, take: limit })` and only then hydrates the operator rows. Anything that has to narrow the *ranking* rather than the *page* must go into that `where`, which means reaching the operator through the flight relation.

**The list cache is conservative by construction.** `OperatorListCacheInterceptor.trackBy` returns `undefined` — no caching — as soon as the request carries a query parameter it does not recognise, and only `recentOnly` is recognised. A new parameter therefore lands in the uncached path with no interceptor change, and cannot collide with `operators:list` or the per-user recent key.

## Goals / Non-Goals

**Goals:**

- Make the traffic-category membership rule the system's behaviour, so no consumer has to expand `both` itself.
- Compose with `recentOnly` rather than have one filter silently defeat the other.
- Keep the unfiltered list byte-for-byte unchanged, including its caching.

**Non-Goals:**

- Filtering by any other operator attribute. `type`, `alliance`, `group`, and `continent` gain no query parameter here; the branch stays a two-filter branch.
- Sorting. The filtered list keeps the unfiltered list's ordering, and the recent list keeps its recency ordering.
- Caching filtered responses.
- A `serviceType` filter anywhere but the operator list. Aircraft, flight, and rotation lists are untouched.

## Decisions

### Category membership, not exact value matching

`serviceType=cargo` returns operators classified `cargo` or `both`; `serviceType=passenger` returns `passenger` or `both`; `serviceType=both` returns only `both`.

_Why:_ the `operator-service-type` capability already stated the rule from the consumer's side — selecting freight carriers must match `cargo` or `both`. Exact matching would make the API contradict its own spec and would make `serviceType=cargo` answer the question "which operators carry *only* freight", which is almost never what a caller wants. The useful question is "who can carry freight for me".

_Alternative considered:_ exact matching, with `both` reachable only by asking for it. Simpler to describe and the more conventional reading of a filter parameter, but it pushes the union back onto every consumer — two requests and a client-side merge to answer the common question. Rejected.

_Consequence:_ `serviceType=passenger` returns eight of the nine seeded carriers, which reads as a near-no-op filter. That is correct rather than surprising: nearly every airline carries passengers. `serviceType=both` remains available for callers that specifically want dual-traffic carriers.

_Where the rule lives:_ `serviceTypesCarrying(traffic)` in `model/operator.model.ts`, returning the enum members that satisfy a request. It is domain vocabulary, not persistence detail, so it sits with the enum it expands and the repository consumes it — the same reason the domain enums are hand-written there rather than imported from `prisma/client/*`.

### Narrow the recent-carrier aggregation, not its result

The traffic filter goes into the `flight.groupBy` `where` as a relation filter — `{ OR: [captain, creator], operator: { serviceType: { in: [...] } } }` — so it applies before `take: limit`.

_Why:_ filtering the four rows the unfiltered query already returned would answer "of your four most recent carriers, which carry freight", so asking for freight carriers could return fewer than four while a fifth matching carrier sat just off the end of the ranking. Narrowing first answers "your four most recent freight carriers", which is what the parameter reads as. With the seeded data the difference is visible: the operations user's unfiltered recent carriers are KLM, AFR, ICE, DLH; filtered to freight, ICE drops out and AAL — previously fifth — takes the fourth slot.

_Alternative considered:_ post-filtering the hydrated operators in the query handler. No repository change and no relation filter, but it silently shortens the page and cannot see past the cap. Rejected.

_Consequence:_ the operator hydration step needs no filter of its own — the ranking it hydrates already contains only matching operators.

### Both filters compose; neither takes precedence

`recentOnly=true&serviceType=cargo` returns the caller's recent freight carriers. The action reads `serviceType` once and passes it into whichever query the `recentOnly` branch selects.

_Why:_ the action already branches on `recentOnly`, and the obvious cheap move — evaluate `recentOnly` first and ignore everything else — would silently drop a parameter the caller supplied. Silently ignoring a supplied filter is worse than either honouring it or rejecting the combination, and honouring it is well-defined here.

_Alternative considered:_ rejecting the combination with `400`. Defensible, and it would keep each filter's semantics independent, but there is a single sensible meaning for the combination, so refusing it would be arbitrary.

### Filtered lists are not cached, by inheriting the interceptor's existing rule

No change to `OperatorListCacheInterceptor`.

_Why:_ the interceptor already declines to cache any request carrying an unrecognised query parameter, so `serviceType` requests read current data. Caching them would mean three more keys per filter value — nine in combination with `recentOnly` — all needing eviction from `OperatorCacheListener`, which today deletes exactly one key. The operator table is small and the filtered query is a sequential scan with a predicate; the cost of the miss is not worth that invalidation surface.

_Secondary benefit:_ a warm cache entry answers before the validation pipe runs, which in this repo has already produced a `200` where a `400` was expected. Leaving the filtered path uncached keeps the invalid-value rejection reliable rather than dependent on cache state.

_Trade-off:_ a client polling `?serviceType=cargo` hits the database every time, while the same client polling the unfiltered list is served from cache. Acceptable, and reversible without a contract change if the filtered list ever becomes hot.

### A pure freight carrier is added to the seed

Cargolux — `CLX` / `CV`, callsign `CARGOLUX`, hub `LUX`, `serviceType: cargo` — is appended to `prisma/seed/resource/operators.seed.ts` as the ninth operator.

_Why:_ without it, `serviceType=cargo` and `serviceType=both` return the same five carriers, so no test can tell membership matching apart from exact matching — the central decision of this change would be unverified. Cargolux is a real scheduled freight airline with no passenger operation, so the fixture is accurate rather than invented, and it keeps a naming convention the seed already follows.

_Why appended rather than inserted:_ the unfiltered list has no `ORDER BY`, so its order is the table's physical order, which is insertion order. Appending leaves all eight existing entries where the assertions already expect them, and the new carrier lands last. It carries no aircraft and no flights, so it appears in no recent-carrier list and in no fleet aggregation.

_Consequence:_ three existing full-list assertions grow by one entry — one in `operator.list.feature` and two in `operator.list-recent.feature`, which asserts the unfiltered list twice while proving the recent variant does not share its cache entry.

## Risks / Trade-offs

**Membership matching will surprise someone expecting exact matching** → `serviceType=cargo` returning a `both` carrier is the whole point, but it is the less conventional reading of a filter. Documented in the Swagger parameter description as well as the spec, so it is visible at the point of use.

**`serviceType=passenger` is nearly a no-op on realistic data** → Eight of nine seeded carriers match. Inherent to the domain, not to the design; `both` is there for callers who want the narrower set.

**The recent branch's semantics are subtle** → "Narrowed before capped" is easy to regress into "capped then narrowed" by moving the filter to the hydration step or into the handler. Pinned by a unit test asserting the relation filter sits in the `groupBy` `where` alongside `take`, and by a feature scenario whose expected body is only correct under narrow-then-cap.

**Filtered lists bypass the cache silently** → A future reader may add `serviceType` to the interceptor's recognised parameters to "fix" the cache miss and inherit a nine-key invalidation problem. The reasoning is recorded above and in the spec's caching requirement.

## Migration Plan

No migration. The change is read-only against an existing column.

1. Reseed the development database (`npm run database:seed`) so the new carrier is present; the Cucumber suite reseeds itself.
2. Restart the `app` container so the list cache does not hold a pre-seed body — the reset step in the test context truncates and reseeds but does not flush the cache.

**Rollback:** removing the parameter from `OperatorListFilters` disables the filter; the seeded carrier can stay or be removed independently, and no stored data depends on either.
