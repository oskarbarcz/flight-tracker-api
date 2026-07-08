## Why

Pilots need current METAR and TAF for the airports involved in the flight they are operating, and they need that data kept fresh automatically rather than fetched by hand. Today the API stores no weather at all. This change introduces airport weather storage that is refreshed on a schedule for the airports that active flights actually care about, and exposes it through a public read endpoint.

## What Changes

- Add a new `airport_weather` table holding the latest raw METAR and TAF text per airport, with the fetch timestamps and a `watch` flag.
- Add weather concerns to the airports module — the weather read model, the watch lifecycle, and the scheduled refresh — distributed across the module's existing DDD parts (no nested `weather/` subdomain tree).
- Integrate a new upstream weather provider (aviationweather.gov) behind a `WeatherClient`, mocked in dev by a new `weather-mock` MockServer container.
- Mark an airport as watched when a pilot checks in for a flight and fetch its weather immediately; stop watching it on on-block unless another still-active flight keeps it watched.
- Refresh METAR and TAF for all watched airports every 5 minutes via a cron service, using a single batched upstream request.
- Add a public endpoint `GET /api/v1/airport/:airportId/weather` returning the stored weather (available to unauthenticated users).

## Capabilities

### New Capabilities

- `airport-weather`: Stores and serves per-airport METAR/TAF weather, keeps it watched and refreshed while flights that reference the airport are active, and exposes it via a public read endpoint.

### Modified Capabilities

<!-- None. The check-in and on-block flows are extended only by listening to their existing domain events; no existing spec requirement changes. -->

## Impact

- **Database:** new Prisma model `AirportWeather` (table `airport_weather`) with an FK to `Airport`; requires `prisma db push` in the app container.
- **New code:** weather pieces added under the airports module's existing DDD parts — `application/command/weather/`, `application/query/weather/`, `application/event/external/weather-flight-lifecycle.listener.ts`, `infra/http/action/weather/get-weather.action.ts`, `infra/service/weather-refresh.service.ts`, and the flat `infra/database/airport-weather.repository.ts`, `model/airport-weather.model.ts`, `model/error/airport-weather.error.ts` (matching how terminals/gates/runways are laid out) — plus `src/core/provider/weather/` (`WeatherClient` + factory + `WeatherModule`). All handlers/actions registered in `AirportsModule`.
- **Events:** new cross-module listener on the existing `PilotCheckedInEvent` and `OnBlockWasReportedEvent`; resolves a flight's airports via the flights domain over the QueryBus. No changes to the emitting commands.
- **Config / infra:** new `WEATHER_API_HOST` env var; new `weather-mock` service in `compose.yaml` fed by `docker/mock/weather.json`.
- **API:** new public route `GET /api/v1/airport/:airportId/weather` (`@SkipAuth()`), keyed by airport UUID, returning `{ metar, metarLastUpdate, taf, tafLastUpdate, watch }` and 404 when no weather row exists.
- **Testing:** Cucumber-only; new `airport_weather` seed rows with fixed v4 UUIDs and full-body assertions.
