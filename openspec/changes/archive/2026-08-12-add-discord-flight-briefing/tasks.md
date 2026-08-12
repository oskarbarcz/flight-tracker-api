## 1. Preference storage

- [x] 1.1 Add `discordBriefingsEnabled Boolean @default(true)` to `model User` in `prisma/schema.prisma` and push the schema to the dev database
- [x] 1.2 Add `getDiscordSettings(userId)` and `updateDiscordSettings(userId, settings)` to `UsersRepository`
- [x] 1.3 Add the `DiscordSettings` model class to the users module `model/`

## 2. Discord settings endpoints

- [x] 2.1 Add `GetUserDiscordSettingsQuery` + handler returning the user's Discord settings
- [x] 2.2 Add `UpdateDiscordSettingsCommand` + handler, with the request DTO validating `briefingsEnabled` as a boolean
- [x] 2.3 Add `GetDiscordSettingsAction` for `GET /api/v1/user/me/discord-settings`
- [x] 2.4 Add `UpdateDiscordSettingsAction` for `PATCH /api/v1/user/me/discord-settings`, dispatching the command then the query
- [x] 2.5 Register the two actions in `controllers` and the two handlers in `providers` of `UsersModule`

## 3. Briefing message

- [x] 3.1 Add `model/discord-message.formatter.ts` turning flight, schedule and weather inputs into each message body, omitting unavailable briefing sections, plus `model/flight-route.ts` for the shared departure/destination lookup
- [x] 3.2 Cover the formatter with a colocated Jest spec: full briefing, missing ATIS, missing weather, schedule and both block-time formats, and both announcements
- [x] 3.3 Replace `DiscordService` with `SendFlightBriefingListener`, `PassengersBoardingNotificationListener` and `FlightArrivalNotificationListener` under `application/event/internal/`, the briefing one short-circuiting on the disabled setting before gathering flight, OFP and departure weather
- [x] 3.4 Resolve departure weather: read via `GetAirportWeatherQuery` with the `all` filter, refresh once via `RefreshWeatherCommand` and re-read when nothing is stored, and pick each report preferring the pilot's default source
- [x] 3.5 Give each listener its own spec, covering the briefing gating and weather fallback, and that a rejected message never breaks the triggering action
- [x] 3.6 Register the three listeners in `FlightsModule` providers and delete `DiscordService`

## 4. Functional coverage

- [x] 4.1 Add a `user.me.discord-settings.feature` covering read, disable, re-enable, invalid payload and the unauthorized cases
- [x] 4.2 Extend `flight.check-in-pilot.feature` with the enriched briefing content and a scenario where a pilot with briefings disabled receives no message
- [x] 4.3 Seed departure-airport weather reports matching the mock fixtures so the briefing content is deterministic despite the concurrent weather refresh

## 5. Verification and docs

- [x] 5.1 Run lint, format and the Jest unit suite
- [x] 5.2 Run the affected Cucumber features, then the full functional suite
- [x] 5.3 Document the briefing content and the settings endpoints in the README Discord section
