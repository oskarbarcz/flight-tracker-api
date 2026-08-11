## Why

The operators view lists every carrier in one flat, unordered block. Anyone who works with the same two or three airlines has to scan the whole list every time to reach the one they want.

The frontend wants a second display mode: a short row of the carriers the signed-in user has most recently worked with, rendered above the existing alphabetic list.

The obvious reading of "recent" — carriers you have flown — turns out to serve the wrong audience. This view is used mostly by operations staff, and they do not fly flights, they schedule them. Scoping recency to the captain would return an empty row for exactly the people who use the view most. Flights already record their captain, but they do not record who scheduled them, so that half of the answer has to be captured before it can be read.

## What Changes

Flights gain a recorded creator, set whenever a flight is created — by hand or by SimBrief import — and backfilled for existing flights from the creation entry already in their event history.

`GET /api/v1/operator` gains an optional `recentOnly` boolean query parameter.

- **Absent or `false`** — unchanged. The full operator list, in its current order, from its current global cache entry.
- **`true`** — returns at most 4 operators: those the requesting user has most recently been involved with, newest first.

"Involved with" means the caller is the flight's captain **or** its creator, so operations see the carriers they schedule and crew see the carriers they fly, from one rule with no role branching. Recency is the flight's creation time, not its completion, so a carrier appears the moment a flight is scheduled for it rather than after it lands.

It returns fewer than 4 entries — including an empty array — when the caller is involved with fewer than 4 distinct carriers. It is deliberately *only* the recents: the frontend already holds the full list and composes the two sections itself, including any de-duplication.

Because the response becomes caller-dependent, the endpoint's existing single global cache entry is no longer safe for the filtered variant. The filtered response is cached per user and invalidated when the caller creates a flight or checks in as its captain.

## Capabilities

### New Capabilities

- `operator-recent-carriers`: Recording who created a flight, ranking the carriers a user has recently flown or scheduled, and exposing the top few through the operator list endpoint.

### Modified Capabilities

None. The unfiltered `GET /api/v1/operator` response is unchanged in content, order, and caching.

## Impact

**API** — `GET /api/v1/operator` accepts a new optional `recentOnly` query parameter. No breaking change: existing callers that omit it observe identical behaviour.

**Affected code**

- `src/modules/operators/infra/http/action/operator/list-operators.action.ts` — accepts the filter DTO, branches to the new query, swaps the cache interceptor.
- `src/modules/operators/infra/http/request/operator.request.ts` — new `OperatorListFilters` DTO.
- `src/modules/operators/application/query/` — new query handler for the recent list.
- `src/modules/operators/infra/database/repository/operators.repository.ts` — new recency aggregation over flights.
- `src/modules/operators/application/event/` — cache invalidation on flight creation and pilot check-in.
- `src/modules/flights/` — `createdById` persisted by the repository, passed by both create commands.
- `prisma/schema.prisma` and a new migration — the column, its foreign key, the indexes, and the backfill.
- `src/core/cache/` — new cache interceptor that keys the two variants apart.
- `src/core/cache/cache.key.ts` — new key for the per-user recent list.
- `src/modules/operators/operators.module.ts` — register the new handler, interceptor, and listener.

**Data** — `flight` gains a nullable `createdById` referencing `user`, backfilled in the migration from `flight_event` rows of type `flight.created`. Two composite indexes, `(captainId, createdAt)` and `(createdById, createdAt)`, serve the two halves of the ranking.

**Tests** — new Cucumber feature for the filtered variant. Three carriers are added to the seed so the operations user is involved with five, exercising the four-item cap; `features/operator/operator.list.feature` grows by those three entries and `features/flight/management/flight.list.feature`'s totals move accordingly.
