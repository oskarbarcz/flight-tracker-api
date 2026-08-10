## 1. Schema and migration

- [x] 1.1 Add `enum WeatherSource { aviation_weather_gov say_intentions }` and `enum WeatherInformationType { atis metar taf }` to `prisma/schema.prisma`, alongside the other enums. Declaration order is load-bearing — Postgres sorts enums by it and the response ordering depends on it.
- [x] 1.2 Add `monitorWeather Boolean @default(false)` to `model Airport`, and change its `weather AirportWeather?` relation to `weather AirportWeather[]`.
- [x] 1.3 Reshape `model AirportWeather`: `id String @id @default(uuid()) @db.Uuid`, `airportId String @db.Uuid`, `source WeatherSource`, `informationType WeatherInformationType`, `content String`, `lastFetched DateTime`, the existing `airport` relation with `onDelete: Cascade`, `@@unique([airportId, source, informationType])`, `@@map("airport_weather")`. Remove `metar`, `metarLastUpdate`, `taf`, `tafLastUpdate`, `watch`.
- [x] 1.4 Add `defaultWeatherSource WeatherSource @default(aviation_weather_gov)` to `model User`.
- [x] 1.5 Write `prisma/migrations/20260810120000_add_say_intentions_weather_source/migration.sql` by hand in the order set out in design.md — Migration Plan: create both enums; add and backfill `airport.monitorWeather` from `airport_weather.watch`; add `user.defaultWeatherSource` with its column default; create the reshaped table and populate it from the two legacy column pairs with a `UNION ALL` of `IS NOT NULL`-filtered selects attributed to `aviation_weather_gov`, using `COALESCE(<legacy timestamp>, NOW())` for the `NOT NULL` `lastFetched`; drop the old table, rename, add the unique index and the FK. Verify by deploying the whole history into a throwaway shadow database and diffing against the datamodel — no drift.
- [x] 1.6 Bring the dev database forward with `docker compose exec app npx prisma db push` and regenerate the client with `npx prisma generate` (`migrate deploy` fails P3005 against this database).

## 2. Domain model

- [x] 2.1 In `src/modules/airports/model/airport-weather.model.ts`, add `WeatherSource` and `WeatherInformationType` TypeScript enums mirroring the Prisma enums, following how `Continent` mirrors its Prisma enum in `airport.model.ts`. Everything outside repositories imports these, not `prisma/client/client`.
- [x] 2.2 Replace `GetAirportWeatherResponse` in the same file with the collection entry shape — `id`, `source` (`enum: WeatherSource`), `informationType` (`enum: WeatherInformationType`), `content`, `lastFetched` — each with an `@ApiProperty` carrying a realistic example. Use a real SayIntentions ATIS string for the ATIS example and a real aviationweather.gov METAR for the METAR example, so the Swagger page shows the two sources' differing formats.
- [x] 2.3 Delete `AirportWeatherNotFoundError` from `src/modules/airports/model/error/airport-weather.error.ts`, and the file if it holds nothing else.

## 3. SayIntentions provider

- [x] 3.1 Add `src/core/provider/sayintentions/type/say-intentions.types.ts` with the raw payload type (`taf`, `metar`, `atis`, and `comms` typed but unused) and a `SayIntentionsWeather = { metar?: string; taf?: string; atis?: string }` result type.
- [x] 3.2 Add `src/core/provider/sayintentions/client/say-intentions.client.ts` — `SayIntentionsClient` plus a `SayIntentionsClientProvider` factory reading `SAY_INTENTIONS_API_HOST` from `ConfigService`, following `weather.client.ts`. One method, `fetchWeather(icaoCode)`, hitting `GET {host}/api/mep/getWX?icao={icao}` through `fetchWithRetry`, throwing on a non-`ok` response, and returning only the fields the payload actually carries — absent or blank fields stay `undefined` so the caller can distinguish "not published" from "empty".
- [x] 3.3 Add `src/core/provider/sayintentions/say-intentions.module.ts` exporting the client, mirroring `weather.module.ts`.
- [x] 3.4 Add `SAY_INTENTIONS_API_HOST="http://sayintentions-mock:1080"` to `.env` and `.env.dist`.
- [x] 3.5 Add the `sayintentions-mock` service to `compose.yaml` on host port `6080` with `MOCKSERVER_INITIALIZATION_JSON_PATH=/config/sayintentions.json`.
- [x] 3.6 Add `docker/mock/sayintentions.json` with one expectation per ICAO code the seeds and features use — EPWA, EDDF, KJFK, KPHL, KBOS — matching on `queryStringParameters: { icao: [...] }` the way `simbrief.json` matches on `userid`. Give each a `metar`, `taf` and `atis` in SayIntentions' own format (no leading `METAR` token), and give one airport a payload with `atis` absent so the partial-answer path is exercised.

## 4. Airports module — repositories

- [x] 4.1 Rewrite `AirportWeatherRepository` for the collection shape: a `selectWeather` const `satisfies Prisma.AirportWeatherSelect` covering `id`, `source`, `informationType`, `content`, `lastFetched`, and an exported `AirportWeatherView`. Drop `watchAirports`, `unwatchFlightAirports`, `listWatched`, `saveWeather` and `findByAirportId`'s old signature.
- [x] 4.2 Add `AirportWeatherRepository.findByAirportId(airportId, source?)`: `where: { airportId, ...(source && { source }) }`, `orderBy: [{ source: 'asc' }, { informationType: 'asc' }]`, `select: selectWeather`.
- [x] 4.3 Add `AirportWeatherRepository.saveReports(airportId, source, reports: { informationType, content, lastFetched }[])`: one `$transaction` of `upsert` calls keyed on `{ airportId, source, informationType }`, so an information type the source did not publish is left untouched rather than cleared.
- [x] 4.4 Add `AirportsRepository.listMonitored(): Promise<WeatherAirport[]>` — `where: { monitorWeather: true }`, selecting `id` and `icaoCode`. Move the `WeatherAirport` type to wherever it now belongs and keep `getIcaoCodes` available for the check-in path.
- [x] 4.5 Add `AirportsRepository.startMonitoring(airportIds)` — `updateMany({ where: { id: { in: airportIds } }, data: { monitorWeather: true } })`.
- [x] 4.6 Add `AirportsRepository.stopMonitoringFlightAirports(flightId)`, moving the existing `unwatchFlightAirports` body across unchanged — the flight's airport ids, minus those still referenced by another flight in `ACTIVE_FLIGHT_STATUSES` — and writing `monitorWeather: false` on `airport` instead of `watch: false` on `airport_weather`.

## 5. Airports module — refresh

- [x] 5.1 Rewrite `RefreshWeatherHandler` to resolve its airport set from `AirportsRepository.listMonitored()` (or `getIcaoCodes` when the command carries ids), return early on an empty set, and fan out to two source branches concurrently with `Promise.allSettled`, logging a rejected branch and letting the other stand.
- [x] 5.2 In the aviationweather.gov branch, keep the existing two batched `WeatherClient` calls and write results through `saveReports(airportId, WeatherSource.AviationWeatherGov, …)`, mapping `metar`/`taf` to `WeatherInformationType` and stamping one `lastFetched` per cycle.
- [x] 5.3 In the SayIntentions branch, call `fetchWeather(icaoCode)` per airport with bounded concurrency (a small fixed limit, not an unbounded `Promise.all` over the whole monitoring set), each airport wrapped so a rejection is logged and skipped without affecting the others, writing whichever of `metar`/`taf`/`atis` came back through `saveReports`.
- [x] 5.4 Keep the existing per-airport log lines, extended to name the source, and keep the warning when a source returned nothing for an airport.
- [x] 5.5 Wrap `WeatherRefreshService.refreshWatchedAirports` (renamed to match the monitoring vocabulary) in a catch that logs, so an unhandled rejection in the scheduled run stops being invisible.

## 6. Airports module — monitoring lifecycle

- [x] 6.1 Rename `WatchAirportsCommand`/`Handler` to `StartMonitoringAirportsWeatherCommand`/`Handler` (file renamed to match) and point it at `AirportsRepository.startMonitoring`.
- [x] 6.2 Rename `UnwatchFlightAirportsCommand`/`Handler` to `StopMonitoringFlightAirportsWeatherCommand`/`Handler` and point it at `AirportsRepository.stopMonitoringFlightAirports`.
- [x] 6.3 Update `WeatherFlightLifecycleListener` to dispatch the renamed commands, keeping the existing `try`/`catch` around the check-in refresh so a total upstream failure cannot fail the check-in.
- [x] 6.4 Confirm `monitorWeather` is absent from `UpdateAirportDto` and `CreateAirportDto`, so the global pipe's `forbidNonWhitelisted` rejects a client that sends it.

## 7. Airports module — read path

- [x] 7.1 Add `src/modules/airports/infra/http/request/weather.dto.ts` with `WeatherSourceFilter` (`user_default`, `all`, `aviation_weather_gov`, `say_intentions`) and a `GetWeatherFilters` class holding `source?` validated with `@IsEnum(WeatherSourceFilter)` + `@IsOptional()`.
- [x] 7.2 Add `GetUserWeatherSourceQuery(userId)` + handler to the `users` module, returning the user's `defaultWeatherSource`, alongside `GetUserSimbriefIdQuery`. Register it in `users.module.ts` providers and export whatever `airports` needs to dispatch it.
- [x] 7.3 Rewrite `GetAirportWeatherQuery` as `GetAirportWeatherQuery(airportId, filter, userId?)` returning `GetAirportWeatherResponse[]`: throw `AirportNotFoundError` when `AirportsRepository.exists` is false, resolve the filter to zero or one `WeatherSource` per the table in design.md — Filter resolution (dispatching `GetUserWeatherSourceQuery` over the bus for `user_default` with a user, falling back to `aviation_weather_gov` without one), then return `findByAirportId(airportId, source)`.
- [x] 7.4 Update `GetWeatherAction`: keep `@SkipAuth()`, add `@Req() request: AuthorizedRequest` and `@Query() filters: GetWeatherFilters` following `ListFlightsAction`, add `@ApiQuery({ name: 'source', enum: WeatherSourceFilter, required: false, default: 'user_default' })`, change `@ApiOkResponse` to `isArray: true`, and describe in `@ApiOperation` that the default reads the caller's profile and falls back to `aviation_weather_gov` when unauthenticated.
- [x] 7.5 Update `airports.module.ts`: import `SayIntentionsModule`, register the renamed handlers, and drop nothing that is still referenced. Confirm the module compiles with every command/query/listener declared.

## 8. Users module — default weather source

- [x] 8.1 Add `defaultWeatherSource` to the `User` model class in `src/modules/users/model/user.model.ts` with `@ApiProperty({ enum: WeatherSource })`, importing the enum from the airports module's model.
- [x] 8.2 Add `defaultWeatherSource` to `GetUserDto`'s `OmitType` list in `get-user.dto.ts`, so administrative reads and the user list keep their shape.
- [x] 8.3 Re-add `defaultWeatherSource` explicitly in `UsersRepository.findOwnById()`, exactly as `simbriefUserId` is, so it reaches `GET /user/me` only.
- [x] 8.4 Add `defaultWeatherSource?` to `UpdateOwnProfileDto` with `@IsEnum(WeatherSource)` + `@IsOptional()`, so `all` and `user_default` are rejected as validation errors.
- [x] 8.5 Confirm the existing profile-update cache invalidation covers the new field — `GET /user/me` must reflect a change immediately.

## 9. Seeds

- [x] 9.1 Rewrite `prisma/seed/resource/weather.seed.ts` as report rows with fresh random v4 UUIDs: Warsaw (`616cbdd7-…`) with all five reports across both sources, Frankfurt (`f35c094a-…`) with only its two `aviation_weather_gov` reports, so `?source=say_intentions` has an airport that legitimately returns `[]`. Keep the existing METAR/TAF text for the `aviation_weather_gov` rows so those assertions stay recognisable, and use SayIntentions-format text for the others.
- [x] 9.2 Set `monitorWeather: true` on Warsaw and leave it `false` on Frankfurt in `airports.seed.ts`, reproducing the old `watch` values so the "retained report of an unmonitored airport" scenario still has its subject.
- [x] 9.3 Set `defaultWeatherSource: WeatherSource.SayIntentions` on Alice (`operations@example.com`) in `users.seed.ts` and leave admin and cabin crew on the column default, so `user_default` resolves differently per user without adding a seed user and disturbing `GET /user` heap order.

## 10. Functional tests

- [x] 10.1 Rewrite `features/airport/weather/airport.get-weather.feature` — the source-filter scenarios from 10.2 live in this same suite rather than a separate file, and the lifecycle scenarios from 10.3/10.4 moved into `flight.check-in-pilot.feature` and `flight.report-on-block.feature` beside the actions that trigger them for the collection shape: the admin / cabin-crew / unauthorized read trio, the retained-reports-of-an-unmonitored-airport scenario, `200` with `[]` for an airport with no reports, `404` for an unknown airport, `400` for a malformed uuid. Assert whole response bodies, in the order the spec fixes.
- [x] 10.2 Add scenarios for every `?source` value: `all`, each named source, `user_default` read by Alice (`say_intentions`), `user_default` read by admin (`aviation_weather_gov`), an anonymous read with no parameter, a named-source read that matches nothing returning `[]`, and an unrecognised value returning `400`.
- [x] 10.3 Extend the check-in scenario to assert reports from both sources land for the flight's airports with `lastFetched` `@date('within 1 minute from now')`, and the on-block scenario to assert the airports stop being monitored while their reports are retained. Monitoring is no longer visible in the response, so assert it through its observable effect — a refresh no longer updating an unmonitored airport — rather than a `watch` field.
- [x] 10.4 Add the partial-answer scenario: the airport whose mock payload omits `atis` ends up with the other reports and no ATIS row.
- [x] 10.5 Add `defaultWeatherSource` to the own-user assertion blocks in `features/user/user.me.feature`, `user.me.update.feature` and `user.me.change-email.feature` (20 blocks), and confirm the administrative user features need no change.
- [x] 10.6 Add a scenario to `user.me.update.feature` setting `defaultWeatherSource` to `say_intentions` and reading it back, plus one rejecting `all` with a validation error.
- [x] 10.7 Statically reconcile every new scenario against the seed and the mock fixtures before running the suite — expected bodies, uuids, ordering and mock ICAO coverage.

## 11. Verification

- [x] 11.1 `docker compose exec app npm run lint` and `npm run format:fix`, reverting the unrelated `.feature` files repo-wide Prettier always churns.
- [x] 11.2 `docker compose exec app npm run build`, then restart the app container and let it settle before any functional run.
- [x] 11.3 `docker compose exec app npm test` — the colocated unit specs still pass.
- [x] 11.4 `docker compose restart sayintentions-mock weather-mock` after touching fixtures, then `docker compose exec app npm run test:functional` for the whole suite.
- [x] 11.5 Read `/api` and check the weather endpoint documents the array response and the `source` parameter, and that `defaultWeatherSource` appears on the own-user schema but not the administrative one.
