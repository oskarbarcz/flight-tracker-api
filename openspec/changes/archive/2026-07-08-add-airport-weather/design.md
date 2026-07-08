## Context

The API models flights, aircraft, and airports but stores no meteorological data. Pilots operating a flight want current METAR and TAF for that flight's airports, kept fresh automatically. Upstream data comes from aviationweather.gov, whose `data/metar` and `data/taf` endpoints accept an `ids=` query that takes a single ICAO code or a comma-joined list and return plain text.

The codebase has strong existing patterns to reuse: external providers as a `Client` + factory (reading `X_API_HOST`) + `Module` (skylink, simbrief, adsb), mocked in dev by MockServer containers fed from `docker/mock/*.json`; DDD-flavored subdomains; CQRS commands/queries dispatched from thin per-endpoint HTTP "action" controllers; cross-module reactions wired through domain events (e.g. `operators/application/event/external/flight-lifecycle.listener.ts`); and cron work via `@nestjs/schedule` `@Cron` services (e.g. `DelayAutoApprovalService`). This design follows those patterns rather than introducing new ones.

## Goals / Non-Goals

**Goals:**

- Persist the latest raw METAR/TAF per airport with fetch timestamps and a `watch` flag.
- Automatically watch an airport while any active flight references it, and refresh watched airports every 5 minutes.
- Serve stored weather from a public, unauthenticated endpoint keyed by airport UUID.
- Stay within the existing provider / subdomain / event / cron conventions.

**Non-Goals:**

- Parsing or decoding METAR/TAF into structured fields (store raw text only).
- Historical weather / trends — only the latest snapshot per airport is kept.
- Weather for airports not attached to a flight (no ad-hoc watch API).
- Pushing weather to clients (no websocket/broadcast); read is pull-only.

## Decisions

### Watch state persisted as a flag, driven by flight lifecycle events

`airport_weather.watch` is a denormalized boolean maintained by a cross-module listener on the existing `PilotCheckedInEvent` (→ watch on + immediate fetch) and `OnBlockWasReportedEvent` (→ watch off unless another active flight holds it). The listener lives in `airports/weather/application/event/external/` mirroring the existing operators/users external flight-lifecycle listeners, and resolves a flight's airports through the flights domain over the QueryBus. No changes to the emitting commands.

- **Why:** matches the established event-driven cross-module pattern; keeps the flights module unaware of weather. Persisting `watch` lets the cron and the read endpoint work off a single cheap query instead of recomputing active-flight membership each tick.
- **Alternative considered:** derive "watched" on the fly from active flights (no column). Rejected — the request calls for a `watch` field, and recomputation on every 5-minute tick and every read is needless work.

### "Active flight" window = CheckedIn through TaxiingIn

On-block clears `watch` for a flight's airports unless another flight in status `CheckedIn`, `BoardingStarted`, `BoardingFinished`, `TaxiingOut`, `InCruise`, or `TaxiingIn` still references the airport. Watching begins at check-in and ends at on-block.

- **Why:** these are exactly the statuses a flight passes through after a pilot checks in and before reaching the gate on arrival — the window where the crew cares about the airports' weather.
- **Alternative considered:** split departure vs arrival watch windows (watch departure only until off-block). Rejected as more complex without clear value; alternates and destination remain relevant throughout.

### Batched upstream fetch

Both the immediate check-in fetch and the 5-minute cron issue one `data/metar` and one `data/taf` request with a comma-joined `ids=` list rather than per-airport calls.

- **Why:** the upstream API supports lists; batching minimizes requests and matches how the cron scales with the watched set.
- **Trade-off:** the client must split the batched text response back to per-ICAO records (aviationweather returns one line/block per station).

### Public read endpoint via `GetWeatherAction`

`GET /api/v1/airport/:airportId/weather` is implemented as a dedicated single-route action controller (`@Controller('api/v1/airport/:airportId/weather')`, `@Get()`, `@SkipAuth()`) in `airports/infra/http/action/weather/get-weather.action.ts`, keyed by airport UUID (`UuidParam`) to match existing airport routes. Missing record → typed error → `404`.

- **Why:** consistent with the per-endpoint action pattern (`GetParkingPositionAction`), and the weather files sit under the airports module's existing DDD parts (`application/command/weather/`, `application/query/weather/`, `infra/http/action/weather/`, flat repository/model/error) rather than in a nested `weather/` subtree.
- **Alternative considered:** add a method to the fat `AirportsController`. Rejected — the newer code favors one action per endpoint, and the user asked for `get-weather.action`.

### New `WeatherClient` provider + `weather-mock`

`src/core/provider/weather/` adds `WeatherClient` (+ factory reading `WEATHER_API_HOST`) and `WeatherModule`, mirroring simbrief/skylink. Dev points `WEATHER_API_HOST` at a new `weather-mock` MockServer container (next free host port) initialized from `docker/mock/weather.json`, serving `/api/data/metar` and `/api/data/taf` with realistic static text for seeded airports.

## Risks / Trade-offs

- **Batched-response parsing is brittle** → keep parsing in `WeatherClient`, validate against the mock fixtures, and store whatever text maps to each requested ICAO (empty/absent stations simply aren't updated).
- **MockServer matches the exact `ids=` query value** → comma-list combinations won't match single-value fixtures; use a query-parameter/regex matcher in `weather.json` so any `ids=` value resolves, or seed the specific combinations used by tests. Flag in tasks.
- **Cron vs test DB reset** → the suite TRUNCATEs/reseeds; `SCHEDULER_ENABLED=false` locally already gates `ScheduleModule`, so the cron won't race the reset. Weather behavior is tested through seed rows + the read endpoint, not by running the cron.
- **Check-in / on-block emit synchronously (`emitAsync`)** → both `PilotCheckedInEvent` and `OnBlockWasReportedEvent` are emitted with `emitAsync`, so the command awaits its listeners (weather watch/unwatch + immediate fetch) before responding. This makes watch state deterministic and black-box testable. Cost: the command waits on its listeners — notably on-block now waits on `position.service`'s ADS-B track download and `discord.service`'s webhook. To keep those failures from failing the command, the weather listener guards its fetch and `position.service`/`discord.service` guard their on-block external calls with try/catch (log-and-continue), matching the "a side-effect must not fail the flight action" invariant.
- **`watch` drift if an event is missed** → the 5-minute cron only refreshes watched airports and does not self-heal watch state; acceptable given events are in-process, and worst case an airport stays watched slightly too long.
- **Watch lifecycle testing** → covered by Cucumber (deterministic thanks to `emitAsync`): checking in a pilot marks every airport of the flight `watch=true` with freshly-fetched METAR/TAF (fetch-time timestamps via `@date('within 1 minute from now')`); reporting on-block for a dedicated seeded `TaxiingIn` flight whose Warsaw airport no other active flight references flips it `watch=true` → `watch=false` while retaining the stored report. A dedicated seed flight is used because every pre-existing on-block-ready flight shares its airports with other active flights (which correctly keep them watched).

## Migration Plan

1. Add the `AirportWeather` model to `schema.prisma` (FK to `Airport`, `airportId @unique`), regenerate the client, and run `prisma db push` in the app container (migrate deploy P3005-fails locally).
2. Add `WEATHER_API_HOST` to `.env` / env config and the `weather-mock` service to `compose.yaml`; add `docker/mock/weather.json`.
3. Ship the provider, subdomain, listener, cron, and action; register all handlers/actions in `AirportsModule`.
4. Add `airport_weather` seed rows (fixed v4 UUIDs) and Cucumber coverage.

Rollback: the feature is additive — remove the route/listener/cron and drop the table; no existing behavior depends on it.

## Open Questions

None outstanding — endpoint shape, watch window, storage format, response fields (including `watch`), and 404-on-missing were resolved during exploration.
