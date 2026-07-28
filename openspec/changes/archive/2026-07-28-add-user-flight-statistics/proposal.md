## Why

Pilots today see only three lifetime numbers — total distance, total flight time, total
fuel — from denormalized counters on their `user` row. There is no time-scoped view (what
did I do this month/year?), no per-dimension breakdown (hours on the A320, airports
visited), and no records. These are exactly the stats that make a logbook feel alive and
keep pilots coming back. The current mechanism also increments counters on a domain event,
which silently double-counts if a completion event is ever delivered twice — and a scalar
counter can never answer a windowed question. This change lays a correct, performant
statistics foundation that the dashboard can read instantly and that a later gamification
layer (badges, leaderboards) can build on without rework.

## What Changes

- **New `statistics` module** owns all user-facing flight stats. It listens to flight
  lifecycle events and maintains read-optimized projections. The `users` module sheds its
  stats responsibility; **BREAKING (internal)**: the `User.totalFlightTime`,
  `User.totalGreatCircleDistance`, and `User.totalFuelBurned` columns are retired — their
  role moves to the `statistics` projections. The public `GET /user/me/stats` response is
  preserved (superset), and the pilot card's `totalFlightTime` is sourced from the
  projection via the bus.
- **The flight is the single source of truth.** Stats are derived projections, never
  incremented independently. On completion events the affected projection slice is
  **recomputed from the flights and overwritten** (not `+=`), making accrual idempotent
  under duplicate/redelivered events and always consistent with source.
- **Three indexed columns added to `Flight`** — `actualAirborneMinutes`,
  `actualBlockMinutes`, `completedAt` — filled at on-block from the actual timesheet and
  **backfilled** for historical completed flights. These make durations aggregatable in SQL
  (they currently live inside the untyped `timesheet` Json) and give an accurate
  "when it flew" handle for calendar windows. Index `(captainId, completedAt)`.
- **Non-time-scoped stats:** lifetime distance / airborne hrs / block hrs / flights /
  cycles / fuel; records (longest flight by distance and by duration, first/last flight
  dates); hours + flights + distance **per aircraft type**; airports / countries /
  continents visited and most-visited airport (world-map ready); most-flown type & airline.
- **Time-scoped (calendar) stats:** distance / hours / flights / fuel for this & last
  week / month / year; new airports & types **unlocked in a period**; an **activity
  heatmap** (flights per day). Calendar boundaries are **UTC (Zulu)** and weeks run
  **Monday–Sunday**.
- **Cycles** are exposed as a metric but always **equal the flight count** (one completed
  sector = one cycle); they are derived, not stored separately.
- **Wrapped-ready by design, not built:** the daily grain retains enough per-day and
  first-seen detail to reconstruct any year, so a later annual "Wrapped" feature needs no
  schema change — but no Wrapped logic ships in this change.
- **Forward hook:** a new `stats-changed` domain event emitted at the recompute point — the
  only concession to the deferred gamification work; nothing consumes it yet.
- Miles counted are **actually flown only** — attributed on `Flight.captainId`; deadhead
  (`UserTravel`) is out of scope.

## Capabilities

### New Capabilities

- `flight-statistics-accrual`: the source-of-truth columns on `Flight`, the idempotent
  recompute-from-source write path triggered by flight-completion events, the historical
  backfill, and the `stats-changed` forward event.
- `user-lifetime-statistics`: non-time-scoped reads — lifetime totals, records, per-type
  and per-airport breakdowns, and most-flown dimensions.
- `user-periodic-statistics`: time-scoped calendar reads — this/last week·month·year
  totals, new airports/types unlocked in a period, and the activity heatmap.

### Modified Capabilities

- _None._ Existing user stats were never captured as an OpenSpec capability; the retirement
  of the `User.total*` columns and the move of `GET /user/me/stats` are covered by the new
  capabilities above and detailed under Impact.

## Impact

- **`statistics` module (new):** `src/modules/statistics/` with the DDD split —
  `application/{command,query,event}`, `infra/{database,http/action}`, `model/`. New
  repositories (the only place `PrismaService` is injected), query handlers, an external
  listener on flight-completion events, and action controllers. Registered in `AppModule`.
- **`flights` module:** the on-block handler fills `Flight.actualAirborneMinutes /
actualBlockMinutes / completedAt`. A cross-module query exposes per-flight completion
  facts to the accrual listener (reads must never load `positionReports` / `loadsheets`).
- **`users` module:** stats endpoint/handler responsibility moves out; the pilot card reads
  `totalFlightTime` from the statistics projection via the bus.
- **Prisma schema:** new columns on `Flight` (`actualAirborneMinutes Int?`,
  `actualBlockMinutes Int?`, `completedAt DateTime?`) + index `(captainId, completedAt)`;
  new tables `user_stats_total`, `user_stats_by_type`, `user_stats_by_airport`,
  `user_stats_daily`; removal of the three `User.total*` columns.
  Migrations plus a backfill (compute the flight columns for historical completed flights,
  then recompute projections per user). Client emits to `prisma/client/` — imports remain
  `from 'prisma/client/client'`.
- **Caching:** reads use the existing `UserAwareCacheInterceptor` (∞ TTL, busted on the
  same accrual path that clears `USER_STATS`; calendar-period reads additionally TTL to the
  next period boundary). New cache keys registered in `src/core/cache/cache.key.ts`.
- **Events:** new `stats-changed` domain event under `src/core/domain/events/`.
- **Functional tests:** new `features/statistics/` Gherkin, seed-fixture driven with fixed
  UUIDs, full-body assertions, and defensive RBAC coverage.
- **Out of scope (deferred):** the annual "Wrapped" feature (the data foundation is built to
  support it, but no Wrapped logic ships now), the badge/achievement engine and levels/XP,
  cross-user leaderboards (need a scheduled snapshot, not per-request sums), and
  deadhead-inclusive "miles traveled".
