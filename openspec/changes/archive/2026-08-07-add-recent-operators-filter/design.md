## Context

`GET /api/v1/operator` is served by a single action, `ListOperatorsAction`, which dispatches `ListAllOperatorsQuery` and is decorated with `@UseInterceptors(CacheInterceptor)` plus `@CacheKey(CACHE_KEYS.OPERATORS_LIST)`. Two properties of that setup shape this design:

- **`@CacheKey` is a static key.** Nest's `CacheInterceptor.trackBy` returns the decorated key verbatim when one is present, and only falls back to the request URL when it is absent. So a query parameter does not vary the cache entry by default. Adding `recentOnly` without touching caching would make both variants collide on `operators:list` — and since the filtered variant is caller-dependent, that is a cross-user data leak, not merely a stale read.
- **The existing invalidation is coarse.** `OperatorCacheListener` deletes the one key on operator and aircraft lifecycle events. There is no wildcard delete in the cache-manager API in use, so a per-user key can only be cleared when the user's identity is known at invalidation time.

Two per-user cache interceptors already exist in `src/core/cache/`: `UserAwareCacheInterceptor`, which prefixes the base key with `user:<sub>:`, and `PeriodStatsCacheInterceptor`, which extends it with a further suffix. Neither fits directly, because this endpoint must stay _globally_ cached in its default form and become _per-user_ only when the filter is set.

The recency data is half-present. `flight` carries `operatorId` and `captainId`, but nothing records who _scheduled_ a flight — only a `flight_event` row of type `flight.created` names the actor. That gap is what forces a schema change rather than a pure read-side feature; see the recency decision below.

## Goals / Non-Goals

**Goals:**

- Add the filter without changing the unfiltered response's content, order, or cache behaviour.
- Make the two variants provably unable to share a cache entry.
- Keep the recency query to a single indexed aggregation.
- Serve operations and crew from one rule, without branching on role.

**Non-Goals:**

- Sorting the unfiltered list. `findAll()` has no `orderBy` today and returns Postgres heap order; the frontend sorts alphabetically client-side. Making the server sort is a separate, deliberate change that would rewrite the full-body assertion in `features/operator/operator.list.feature`. Out of scope here.
- Merging the two lists server-side or de-duplicating across them. The frontend composes the two sections.
- A configurable result size. Four is a constant.
- Ranking by flight count, hours, or distance. Recency only.

## Decisions

### The filter is a query parameter on the existing endpoint, not a new route

A dedicated `GET /api/v1/operator/recent` would sidestep the cache-key collision for free, since Nest's default `trackBy` keys on the URL. It was rejected because the resource and its representation are identical — the filtered response is a subset of the same `Operator[]` — and the codebase's one-action-per-endpoint convention is about endpoints, not about response variants of one endpoint. The collision is solvable and worth solving explicitly.

Validation follows the established `@Query() filters: XListFilters` DTO pattern used by the flight, airport, rotation, and user list actions. The parameter is named `recentOnly` so that the DTO can declare it as a plain TypeScript identifier (`recentOnly?: boolean`) rather than a quoted property, and so that the wire name and the property name stay the same thing in one place — the global validation pipe runs `whitelist` with `forbidNonWhitelisted`, so mapping a differently-spelled wire name onto the property through `@Expose` would leave the raw key behind as an extraneous property and be rejected.

Strict boolean validation — `true` and `false` only, everything else a `400` — is chosen over lenient coercion because silently reading `?recentOnly=yes` as `false` would return the full 200-entry list where the caller expected four, and the frontend would render it into a four-slot row.

### A branching cache interceptor, not a second action

A new interceptor in `src/core/cache/` overrides `trackBy` and returns one of two keys depending on whether the filter is set:

```
recentOnly absent/false  →  operators:list                      (shared, unchanged)
recentOnly=true          →  user:<sub>:operators:list:recent     (per-caller)
```

It extends `CacheInterceptor` rather than `UserAwareCacheInterceptor`, because the latter unconditionally prefixes with the user id and would fragment the default list into one entry per user — a silent regression in the shared cache's hit rate.

Distinct key namespaces are what make the two variants unable to collide; the spec's poisoning scenarios test that property from the outside.

### The interceptor declines to cache a request it cannot recognise

Discovered during implementation: Nest runs interceptors _before_ pipes, and `CacheInterceptor` returns the cached value directly on a hit, so the route handler and its `ValidationPipe` never execute. Combined with a static `@CacheKey`, that means any query string at all — `?recentOnly=maybe`, `?bogus=1` — collides with the cached entry and is answered `200` with the shared list instead of `400`.

This hole predates the change (`?bogus=1` already behaved this way), but the filter makes it consequential: a typo'd parameter would silently return the full list where the view expects at most four, which is precisely the failure the strict boolean validation was chosen to prevent. Validation cannot be moved ahead of the interceptor, so the interceptor is made conservative instead — `trackBy` returns `undefined`, opting the request out of both cache read and cache write, unless the query consists of nothing but a `recentOnly` whose value is exactly `true` or `false`. Unrecognised requests therefore always reach the handler and are rejected by the pipe.

The TTL is expressed as a `CacheTTLFactory` rather than a constant, because the two variants need different expiry and the decorator applies to the route as a whole. The factory returns `undefined` for the shared variant so no TTL argument is passed and the entry stays untimed, as it is today; `0` would not work, since cache-manager resolves `ttl ?? options.ttl` and would take the zero literally. The exported factory type does not admit `undefined`, so the assignment carries one cast at the point of definition.

### Recency spans captain and creator, on one clock

The first cut scoped recency to `captainId` over `completedAt`. That is wrong for the audience: the operators view is used mostly by operations staff, who schedule flights rather than fly them, so the row would have been empty for its primary users. It only looked correct in testing because the seed had been given operations-as-captain flights, which is not a shape the real system produces.

The fix has two halves. Flights gain a `createdById`, mirroring the existing `Rotation.createdById` / `"RotationCreatedBy"` naming already in the schema. And the ranking unions the two routes:

```
recency(operator) = MAX(flight.createdAt)
                    WHERE captainId = me OR createdById = me
```

A role branch — operations reads `createdById`, crew reads `captainId` — was considered and rejected. It puts role logic inside a query handler, leaves admin undefined, and silently halves the history of anyone who both dispatches and flies. The union needs no role at all and degrades gracefully for every role including ones added later.

Ranking on `createdAt` rather than `completedAt` follows from the same audience argument: a dispatcher who schedules three flights this morning wants those carriers to hand immediately, not after the aircraft are on-block. Applying the same clock to captains keeps one rule for one list, and drops the `completedAt IS NOT NULL` filter entirely — in-progress and not-yet-departed flights now count, which is the point.

### Invalidation follows involvement, with a TTL backstop

Two things stale a cached recent list, and they need different mechanisms:

| Trigger                          | Whose entry                 | Mechanism                           |
| -------------------------------- | --------------------------- | ----------------------------------- |
| Caller creates a flight          | Exactly one, known id       | Explicit `del` on the creator's key |
| Caller checks in as captain      | Exactly one, known id       | Explicit `del` on the pilot's key   |
| An operator's details are edited | Every user involved with it | TTL expiry                          |

Flight _completion_ no longer affects the ranking at all, so the listener watches `FlightWasCreated` and `PilotCheckedIn` instead. Both carry `actorId` in their payload — the creator and the checking-in pilot respectively — so the listener needs no bus query to resolve a user, unlike the completion-based version it replaces.

The operator-details case cannot be precise without a wildcard delete or a registry of which users cached which operators, both of which cost more than the problem is worth. A bounded TTL on the per-user entry accepts the staleness instead. `CACHE_TTL_MS.USER_ME` (60s) is the closest existing precedent for a per-user read of frequently-edited data; reuse that magnitude.

The unfiltered list keeps its existing untimed entry and its existing listener, untouched.

### The aggregation lives in `OperatorsRepository`

`OperatorsRepository.countFlights()` already reads `prisma.flight` directly, so the operators module has established precedent for aggregating over flights locally rather than dispatching a query to the flights module. Adding a second flight aggregation next to it keeps the two together instead of splitting one concern across two modules.

This is knowingly at odds with CLAUDE.md's "cross-module reads go through the bus, never `prisma.*` directly". The rule is right in general; the exception was taken deliberately here because the alternative — a `GetRecentOperatorIdsByCaptainQuery` in the flights module returning ids that the operators module then hydrates — spreads one aggregate across two modules and a bus hop to satisfy a boundary that `countFlights` already crosses in the same file. If `countFlights` is ever moved behind the bus, this should move with it.

The query is one `groupBy`, served by the two new composite indexes:

```
flight.groupBy({
  by: ['operatorId'],
  where: { OR: [{ captainId: userId }, { createdById: userId }] },
  _max: { createdAt: true },
  orderBy: [{ _max: { createdAt: 'desc' } }, { operatorId: 'asc' }],
  take: 4,
})
```

The secondary `operatorId` ordering is not cosmetic: without it, two operators tied on recency at the fourth and fifth positions would be _selected_ nondeterministically, before the presentation tie-break below ever runs. Sorting on a grouped column is the one tie-break the aggregation itself can express.

Then hydrate the operator bodies by id and re-apply the ranking order — `findMany({ where: { id: { in: ids } } })` does not preserve the order of `in`, so the handler must reorder against the ranked id list rather than trusting the fetch.

### Ties break on ICAO code

`ORDER BY MAX(completed_at) DESC` alone is non-deterministic when two operators share a timestamp, and this repository has a recorded history of exactly that class of flakiness in full-body Cucumber assertions. A secondary `icaoCode` ascending sort makes repeated identical requests byte-identical. Prisma's `groupBy` cannot order by a non-grouped column, so the tie-break is applied when reordering the hydrated operators, not in the aggregation.

## Risks / Trade-offs

**A partially-written flight completion could be read before invalidation lands.** The listener runs on an event, asynchronously relative to the request that triggered it. A pilot who completes a flight and immediately reloads the operators view may see the pre-completion list. The window is small, self-healing on the next request, and identical in character to how user statistics already refresh — accepted rather than mitigated.

**Operator edits are stale for up to the TTL in the recent row while being instant in the full list.** The two sections of the same screen can briefly disagree about a carrier's name or logo. Acceptable: operator details change rarely, the divergence is cosmetic and bounded.

**The per-user key multiplies cache entries by the active user count.** Each entry is at most four operator bodies and expires within the TTL, so the ceiling is small; the existing per-user statistics keys already establish this footprint.

**A cancelled or mistaken flight still counts.** Because a carrier becomes recent the moment a flight is created for it, a flight created in error puts its operator at the top of the creator's row until four newer ones displace it. Accepted: the row is a convenience shortcut, not a record, and the alternative — reacting to deletion — adds machinery for a rare case.

**`createdById` is nullable and the backfill is best-effort.** Flights whose event history names no creator keep a null and contribute nothing by the creation route. They still contribute by the captain route if they have one.

**Deep-compare in the Cucumber context matches exact key sets, not subsets.** The new feature's full-body assertions carry every operator field.

**The seed had to grow to test the cap.** Only three seeded operators can hold flights: LOT and BAW are deliberately dependency-free so `operator.delete.feature` can delete them, and Condor's two aircraft are both pinned — one asserted at zero flights, the other deleted by `aircraft.delete.feature`. Three new carriers (AFR, ICE, KLM) with one aircraft each were added rather than disturbing any of that, taking the operations user to five involved carriers so the four-item cap truncates a real fixture. Their flights are `Created`, captain-less and dispatched by operations, which is both the realistic shape and the one that exercises "not yet flown still counts".
