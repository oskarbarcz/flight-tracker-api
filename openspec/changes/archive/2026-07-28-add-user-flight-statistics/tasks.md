## 1. Schema & migration

- [x] 1.1 Add `actualAirborneMinutes Int?`, `actualBlockMinutes Int?`, `completedAt DateTime?` to `Flight` in `prisma/schema.prisma`, plus `@@index([captainId, completedAt])`.
- [x] 1.2 Add models `user_stats_total` (1:1 user), `user_stats_by_type` (unique userId+type), `user_stats_by_airport` (unique userId+airportId), `user_stats_daily` (unique userId+day) with the fields from design §4. Ensure `user_stats_daily` retains per-day distance/minutes/fuel and the dimension tables retain first-seen dates so a later Wrapped is a pure read.
- [x] 1.3 Remove `totalFlightTime`, `totalGreatCircleDistance`, `totalFuelBurned` from `User`.
- [x] 1.4 `prisma db push` against the dev DB and `npx prisma generate` (client emits to `prisma/client/`).

## 2. Flight completion facts (source of truth)

- [x] 2.1 In the flights on-block handler, compute and persist `actualAirborneMinutes` (takeoff→arrival), `actualBlockMinutes` (offBlock→onBlock) and `completedAt` (actual on-block) from the actual timesheet; null only the affected duration when a timestamp is missing.
- [x] 2.2 Add a flights-module query (bus) returning per-flight completion facts for a captain — scalar columns only (`captainId`, `greatCircleDistance`, `totalFuelBurned`, `actualAirborneMinutes`, `actualBlockMinutes`, `completedAt`, `aircraftId`/type, `operatorId`, departure/arrival airport ids). Never select `positionReports`/`loadsheets`.
- [x] 2.3 Register the new query handler in the flights module `providers`.

## 3. Statistics module scaffold

- [x] 3.1 Create `src/modules/statistics/` with the DDD split (`application/{command,query,event}`, `infra/{database,http/action}`, `model/`) and `statistics.module.ts`.
- [x] 3.2 Register `StatisticsModule` in `AppModule`.
- [x] 3.3 Define domain error classes under `model/error/*.error.ts` extending the core category classes (no `@nestjs/common` exceptions). (`InvalidActivityRangeError extends BadRequestError` for the heatmap range.)

## 4. Projection repositories

- [x] 4.1 Implement a statistics repository (the only place `PrismaService` is injected here) with idempotent upserts for each projection table. (`replaceForUser` — transactional overwrite.)
- [x] 4.2 Implement recompute slices: total, by-type, by-airport, daily, and most-flown operator — derived from source via the flights completion-facts query, overwriting stored rows (no increment). Cycles derived as the flight count. (Pure `computeProjections` in `model/`.)

## 5. Accrual & forward event

- [x] 5.1 Add an external listener in `application/event/external/` on `OnBlockWasReportedEvent` (primary) and `FlightWasClosedEvent` that recomputes for the captain; skip flights without a captain.
- [x] 5.2 Define a `stats-changed` domain event under `src/core/domain/events/` and emit it (with the affected userId) at the end of a recompute.
- [x] 5.3 Bust the user's stat caches on recompute.
- [x] 5.4 Register the listener and command handler in the module `providers`.

## 6. Lifetime read surface (non-time-scoped)

- [x] 6.1 Query + response model for lifetime totals (cycles = flight count), records (longest by distance/duration, first/last), per-type breakdown + most-flown type, per-airport/geography + most-visited, most-flown airline.
- [x] 6.2 Action controller for `GET /user/me/stats` — legacy shape preserved exactly (distance, flight time, fuel), now sourced from the projection.
- [x] 6.3 Action controllers: `/me/stats/aircraft-types` (per-type) and `/me/stats/summary` (rich totals + records + geography + most-flown, with operator/airport hydration). Records + geography consolidated into `/summary` rather than separate endpoints; register queries and controllers in the module.

## 7. Periodic read surface (time-scoped, calendar)

- [x] 7.1 Query summing `user_stats_daily` over calendar windows (current/previous week, month, year), scoped by `completedAt`, boundaries in UTC and weeks Monday–Sunday; period-over-period pairs.
- [x] 7.2 Airports/types unlocked in a period (first-seen within the window) — folded into the `/periods` response per period.
- [x] 7.3 Query for the activity heatmap series (per-day flights + minutes over a requested range).
- [x] 7.4 Action controllers for the period and activity reads; register in the module.

## 8. Caching

- [x] 8.1 Add stat cache keys/TTLs to `src/core/cache/cache.key.ts` (per-user helpers + `periodStatsCacheKey`).
- [x] 8.2 Apply `UserAwareCacheInterceptor` (lifetime/dimension, ∞ TTL, busted on recompute) and a `PeriodStatsCacheInterceptor` that stamps the UTC day into the key so period/activity reads expire at the calendar boundary.

## 9. Users module cutover

- [x] 9.1 Remove the legacy increment listener path and the `User.total*` reads/writes from `users`; move `GET /user/me/stats` into the statistics module.
- [x] 9.2 Point the pilot card's `totalFlightTime` at the statistics projection via a bus query (`GetPilotHandler`).

## 10. Backfill

- [x] 10.1 Backfill implemented as `prisma/seed/resource/statistics.seed.ts` (`loadStatistics`): fills `Flight.actual*Minutes`/`completedAt` from each completed flight's actual timesheet, reusing the shared `computeProjections`. A standalone prod backfill can wrap the same derivation.
- [x] 10.2 Derives every captain's projection from source; idempotency verified by the `computeProjections` unit spec and the `statistics.close-flight` functional test (close re-derives without double-counting).
- [x] 10.3 Seed now populates the flight columns + projections for seeded pilots, keyed off the existing fixed seed UUIDs.

## 11. Tests

- [x] 11.1 Colocated Jest `*.spec.ts`: `compute-projections.spec.ts` (aggregation, missing-timestamp, idempotency, operator tie-break) and `period.spec.ts` (UTC + Monday-anchored week boundaries, inclusive/exclusive).
- [x] 11.2 Functional `features/statistics/` Gherkin (summary, aircraft-types, periods, activity, close-flight) + updated `user-stats.get` + report-on-block accrual assertion, seed-fixture driven with full-body assertions.
- [x] 11.3 Defensive RBAC coverage for each read endpoint (admin/cabin-crew 200, unauthorized 401).

## 12. Verification

- [x] 12.1 `npm run lint` + `format:fix` — clean.
- [x] 12.2 `npm run build` — clean.
- [x] 12.3 `npx jest src/modules/statistics` (11 passed) and `npm run test:functional` (772 scenarios / 3553 steps passed).
- [x] 12.4 `openspec validate add-user-flight-statistics --strict` — valid.
- [x] 12.5 Committed migration `20260723120000_add_user_flight_statistics` (generated from the schema diff).
