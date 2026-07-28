## Context

Today the only user statistics are three denormalized counters on the `user` row
(`totalFlightTime`, `totalGreatCircleDistance`, `totalFuelBurned`), read by
`GET /user/me/stats` and incremented by a listener on `OnBlockWasReportedEvent`
(`users/application/event/external/flight-lifecycle.listener.ts`), read-through cached with
no TTL and busted on write. This works for lifetime totals but has two structural limits:

- **A scalar counter cannot be windowed.** "Miles this month" is unanswerable from a total.
- **Blind increment is not idempotent.** If a completion signal is delivered twice (client
  retry, auto-detection plus manual report, event redelivery, restart mid-processing) the
  counter is corrupted permanently, with no record of which flights were counted.

Durations live inside the untyped `Flight.timesheet` Json blob, so they cannot be
aggregated in SQL; distance is already a scalar (`Flight.greatCircleDistance`). The scale is
modest — this is a sim tracker, so a heavy pilot has hundreds to low thousands of completed
flights. The dashboard needs immediate reads. The in-progress `aircraft-utilization` ledger
(add-aircraft-technical-logbook) establishes the house pattern of accruing per-entity totals
on `OnBlockWasReportedEvent`; this change applies the same event seam, keyed on the pilot.

## Goals / Non-Goals

**Goals:**

- Non-time-scoped stats (lifetime, records, per aircraft type, per airport/geography,
  most-flown) and time-scoped calendar stats (this/last week·month·year, unlocked-in-period,
  activity heatmap).
- Immediate reads (dashboard-grade) with correctness that cannot drift from the flights.
- Idempotent accrual — duplicate completion signals never corrupt totals.
- Backfill of historical activity.
- A data foundation rich enough that a later annual "Wrapped" feature can be built as a
  read over existing projections, with no schema change.
- A clean seam for a later gamification layer, with no gamification built now.

**Non-Goals:**

- The annual "Wrapped" recap feature itself — foundation only; the dedicated Wrapped logic
  (generation, snapshot, endpoint) is deferred to a later change.
- Badge / achievement engine, levels/XP (deferred; a badge is a threshold predicate over
  these stats, so no badge-specific storage is needed now).
- Cross-user leaderboards (global; require a scheduled snapshot, not per-request sums).
- Deadhead-inclusive "miles traveled" — only miles actually flown (`Flight.captainId`).
- Actual-track distance — great-circle distance remains the distance measure.

## Decisions

### 1. A dedicated `statistics` module, not more bolt-on in `users`

The feature has its own projections, event listeners, read endpoints, Wrapped, and a future
gamification surface — a real bounded context. Keeping it in `users` would entangle identity
with analytics. New `src/modules/statistics/` follows the uniform DDD split; it listens to
flight-completion events and owns the projections. `users` sheds stats: the `User.total*`
columns are removed and the pilot card reads `totalFlightTime` from the projection via the
bus. `GET /user/me/stats` keeps its URL and response superset (a controller may live in any
module). _Alternative — extend `users`:_ rejected; it grows an already-large module and
mixes concerns.

### 2. The flight is the single source of truth; projections are recomputed, never incremented

Every stat derives from the pilot's completed flights. On a completion event the affected
projection slice is **recomputed from the flights and overwritten**, e.g.
`by_type[pilot, A320] = Σ(flights where captain=pilot ∧ type=A320)`. This is idempotent by
construction (re-running yields the same value → the double-count bug disappears) and the
projections can never drift from source. Writes cost a few scoped aggregates per completed
flight — rare and cheap; reads are lookups (write-heavy, read-light, as intended).
_Alternative — increment counters:_ rejected (the current, non-idempotent, drift-prone
approach). _Alternative — pure read-time aggregation with cache only:_ viable at this scale,
but a cold in-memory cache (no Redis) would recompute on every dashboard hit after a
restart; materialized projections give predictable read latency and a base leaderboards can
later build on.

### 3. Three indexed completion-fact columns on `Flight`, keyed on `completedAt`

Add `actualAirborneMinutes Int?`, `actualBlockMinutes Int?`, `completedAt DateTime?`, filled
at on-block from the actual timesheet, plus index `(captainId, completedAt)`. This removes
the JSON-aggregation blocker (durations become summable scalars) and gives an accurate "when
it flew" handle. Time-scoping keys off `completedAt`, **not** `createdAt` — a flight created
in one month and flown in the next belongs to the month it flew. A missing actual timestamp
nulls only the affected duration. _Alternative — parse `timesheet` JSON at read/recompute:_
rejected; unindexable and repeated per recompute. _Alternative — a separate per-flight fact
table:_ rejected as redundant; the flight already holds captain, distance, aircraft, and
airports — only durations and a flown-timestamp were missing.

### 4. Projection tables; a single daily time-grain (no month/year rollups)

`user_stats_total` (1/user: lifetime totals + records + first/last),
`user_stats_by_type` (1/user·type), `user_stats_by_airport` (1/user·airport: visits +
first/last), `user_stats_daily` (1/user·day). `user_stats_daily` is the only time-grain: it
powers the heatmap directly **and** every calendar window via a small cached `SUM` of the
days in the window (~365 rows/year ≈ sub-ms). Deliberately no month/year rollup tables — one
grain means nothing can drift out of sync; coarser rollups can be materialized later only if
a specific card proves hot. Per-operator "most-flown airline" is derived from a lightweight
per-operator count (folded into the recompute). Because the daily grain retains per-day
distance/minutes/fuel and the dimension tables retain first-seen dates, a later annual
"Wrapped" is a pure read over these tables — no Wrapped-specific storage is added now.
_Alternative — month + year + day rollups:_ rejected now (three grains to keep consistent
for a sub-millisecond saving).

### 5. Caching on the existing per-user interceptor

Reads use `UserAwareCacheInterceptor` with new keys in `src/core/cache/cache.key.ts`.
Lifetime/dimension reads cache with no TTL, busted on the same accrual path that clears
`USER_STATS`. Calendar-period reads additionally carry a TTL to the next period boundary, so
a period rolls over without a write. Wrapped snapshots are immutable once generated.

### 6. `stats-changed` domain event as the only forward hook

At the recompute point the statistics module emits a `stats-changed` event carrying the
affected user id (under `src/core/domain/events/`). Nothing consumes it in this change; the
future badge engine subscribes here with zero rework.

## Risks / Trade-offs

- **Recompute-from-source costs more per write than an increment** → acceptable: writes are
  rare (one per completed flight) and each aggregate is scoped to one pilot's flights over an
  indexed column; reads (the hot path) stay lookups.
- **Removing `User.total*` is an internal breaking change** → mitigate: `GET /user/me/stats`
  keeps its response superset and the pilot card reads from the projection; do the migration
  - backfill in one deploy so no read path sees the columns gone before projections exist.
- **`completedAt` depends on an actual on-block time** → flights completed without one get a
  null duration but still count as a flight/cycle; backfill derives `completedAt` from the
  best available actual time and falls back conservatively (documented in the backfill).
- **In-memory cache is per-instance and cold after restart** → acceptable because
  projections are durable; a cold cache re-reads stored rows (lookups), not full
  recomputation. Redis is out of scope.
- **Reads that touch `Flight` must avoid heavy JSON** → the cross-module completion query
  selects only scalar columns; never `positionReports` / `loadsheets`.
- **Backfill on a large flight table** → run in batches; it is idempotent so it can resume.

## Migration Plan

1. Schema migration: add the three `Flight` columns + index `(captainId, completedAt)`;
   create the five `user_stats_*` tables; remove the three `User.total*` columns.
2. Backfill: compute the completion-fact columns for historical completed flights, then
   recompute every pilot's projections once (idempotent, batched).
3. Cut over `GET /user/me/stats` and the pilot card to the projections in the same deploy.
4. Rollback: the change is additive except for the dropped `User.total*` columns; a rollback
   restores those columns and re-runs the legacy increment listener. Because projections are
   derived, no stats data is lost on roll-forward re-deploy.

## Resolved Decisions

- **Calendar boundaries are UTC (Zulu).** A flight belongs to the period its `completedAt`
  falls in, evaluated in UTC — matching how aviation logs time. No home-airport-timezone
  handling.
- **Weeks run Monday–Sunday.** A "week" period starts Monday 00:00 UTC.
- **`cycles` always equals the flight count.** One completed sector = one cycle; it is
  exposed as a metric but derived from the flight count, not stored as an independent value
  that could diverge (no touch-and-go modelling).
- **Wrapped is foundation-only in this change.** The dedicated Wrapped logic (generation,
  snapshot, endpoint) is deferred; the daily grain + first-seen dimension dates are designed
  so it can later be a read over existing tables with no schema change.

## Open Questions

- _None outstanding._
