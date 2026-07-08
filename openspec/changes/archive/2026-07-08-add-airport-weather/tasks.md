## 1. Database

- [x] 1.1 Add `AirportWeather` model to `prisma/schema.prisma` (map `"airport_weather"`): `airportId String @db.Uuid @id` (FK to `Airport`), `metar String?`, `metarLastUpdate DateTime?`, `taf String?`, `tafLastUpdate DateTime?`, `watch Boolean @default(false)`; add the reverse relation on `Airport`.
- [x] 1.2 Regenerate the Prisma client (`npx prisma generate`, output stays `prisma/client/`) and run `prisma db push` in the app container.

## 2. Weather provider

- [x] 2.1 Add `src/core/provider/weather/type/weather.types.ts` for the per-ICAO METAR/TAF result shape.
- [x] 2.2 Add `src/core/provider/weather/client/weather.client.ts` — `WeatherClient` + factory reading `WEATHER_API_HOST`; methods to fetch METAR and TAF for a batch of ICAO codes via `ids=` (comma-joined) and split the plain-text response back to per-ICAO entries.
- [x] 2.3 Add `src/core/provider/weather/weather.module.ts` exporting `WeatherClient`.
- [x] 2.4 Add `WEATHER_API_HOST` to `.env` / `.env.dist` and any env config/validation.

## 3. Dev mock

- [x] 3.1 Add `docker/mock/weather.json` serving `/api/data/metar` and `/api/data/taf` with realistic static METAR/TAF text for seeded airports; matcher is path-only so any `ids=` value (single or comma list) resolves.
- [x] 3.2 Add the `weather-mock` service to `compose.yaml` (host port `4080`, `MOCKSERVER_INITIALIZATION_JSON_PATH=/config/weather.json`) and point `WEATHER_API_HOST` at it.

## 4. Weather subdomain — model & data access

- [x] 4.1 Add `src/modules/airports/model/airport-weather.model.ts` (the `GetAirportWeatherResponse` shape `{ metar, metarLastUpdate, taf, tafLastUpdate, watch }`).
- [x] 4.2 Add `src/modules/airports/model/error/airport-weather.error.ts` typed error for a missing weather record.
- [x] 4.3 Add a Prisma-backed repository under `infra/database/` for `airport_weather`: upsert weather + timestamps, set/clear `watch`, get by airportId, list watched (with airport ICAO codes). Watch/unwatch resolve a flight's airports directly via `airport_flight` + `flight.status` (same cross-module Prisma pattern the operators `FlightLifecycleListener` already uses, not the QueryBus route sketched in design.md).

## 5. Weather subdomain — commands & query

- [x] 5.1 Add `RefreshWeatherCommand` handler: given airport ids (or all watched when none given) fetch via `WeatherClient` and upsert rows with fetch-time timestamps.
- [x] 5.2 Add set-watch command handlers (`WatchFlightAirportsCommand` + `UnwatchFlightAirportsCommand`): set/clear `watch` for a flight's airports, upserting rows as needed on the check-in path.
- [x] 5.3 Add `GetAirportWeatherQuery` handler: return the record for an airport UUID, or throw the typed not-found error.

## 6. Watch lifecycle listener

- [x] 6.1 Add `application/event/external/flight-lifecycle.listener.ts` reacting to `PilotCheckedInEvent`: set `watch=true` for the flight's airports, then trigger an immediate `RefreshWeatherCommand`; failures log without failing check-in.
- [x] 6.2 Extend the listener for `OnBlockWasReportedEvent`: clear `watch` for the flight's airports except any still referenced by a flight in an active status (`CheckedIn`..`TaxiingIn`); records are retained.

## 7. Cron refresh

- [x] 7.1 Add `infra/service/weather-refresh.service.ts` with `@Cron(CronExpression.EVERY_5_MINUTES)`: dispatch `RefreshWeatherCommand` (loads watched airports, one batched METAR + one batched TAF request, writes results back; no-op when none watched).

## 8. HTTP endpoint

- [x] 8.1 Add `infra/http/action/get-weather.action.ts` — `@Controller('api/v1/airport/:airportId/weather')`, `@Get()`, `@SkipAuth()`, `UuidParam`; returns the query result; 404 via the typed error when no record.
- [x] 8.2 Add Swagger metadata (tag, `@ApiOkResponse`, `@ApiNotFoundResponse`, `@ApiBadRequestResponse`) consistent with existing actions.

## 9. Module wiring

- [x] 9.1 Import `WeatherModule` and register the action (controllers), repository, command/query handlers, listener, and cron service in `AirportsModule` providers.

## 10. Seed & tests

- [x] 10.1 Add `airport_weather` seed entries (`prisma/seed/resource/weather.seed.ts`, registered in `load-resources.ts`): EPWA watched with data, EDDF unwatched but retaining data; BIKF deliberately left without a row for the 404 case.
- [x] 10.2 Add a Cucumber feature for `GET /api/v1/airport/:airportId/weather`: found watched (full-body assert incl. `watch=true`), found unwatched (`watch=false`), 404 when no record, 400 on invalid UUID. All passing.
- [x] 10.3 Watch-lifecycle Cucumber coverage — check-in and on-block now emit their events via `emitAsync` (`check-in-pilot.command.ts`, `report-on-block.command.ts`), so the watch/unwatch + immediate fetch complete before the response and the behavior is deterministic (the on-block external listeners `position.service`/`discord.service` are wrapped in try/catch so an ADS-B/Discord failure can't fail on-block). Scenarios: (a) check-in a pilot → every airport of the flight (`23952e79`) returns `watch=true` with fetched METAR/TAF (fetch-time timestamps via `@date('within 1 minute from now')`); (b) report on-block for a dedicated seeded `TaxiingIn` flight (`DLH500`, `eaa29705…`) whose Warsaw (EPWA) airport is referenced by no other active flight → EPWA flips `watch=true` → `watch=false` while its stored report is retained. Both reset with `I set database to initial state`.

## 11. Verify

- [x] 11.1 Ran `lint:fix`, `format:fix`, `build`, and the new `airport.get-weather.feature` in the app container (all green); `weather-mock` was started fresh from its fixture with the stack.
