## Context

See `proposal.md` — Why. The moving parts already exist and only need to be composed:

- `DiscordService.onPilotCheckedIn` (flights module, `infra/service/`) already listens on `PilotCheckedIn`, resolves the actor's Discord id and sends a direct message of type `briefing`, with the SimBrief PDF URL as an attachment.
- `WeatherFlightLifecycleListener` (airports module) also listens on `PilotCheckedIn`, flips `monitorWeather` on for every airport of the flight and runs `RefreshWeatherCommand` for them. ATIS comes from SayIntentions only; METAR and TAF come from both providers.
- `GetAirportWeatherQuery(airportId, source, userId)` reads the stored reports, and `GetUserWeatherSourceQuery` exposes the pilot's preferred provider.
- Per-user preferences have one precedent: `User.defaultWeatherSource`, carried on the profile and edited through `PATCH /api/v1/user/me`.

Two constraints shape the design. First, `DomainEventEmitter.emitAsync` starts every listener for an event concurrently, so the Discord listener cannot assume the weather listener has finished — the two race. Second, outside production `TestDiscordClient` writes each message to `test-data/discord/<type>_<flightId>.md`, which is what the Cucumber Discord context asserts against.

## Goals / Non-Goals

**Goals:**

- Compose the briefing body from data the system already holds, with every section independently optional.
- Keep briefing text generation pure and unit-testable, separate from event handling and I/O.
- Give the preference its own endpoint pair so further Discord settings can join it without reshaping the profile payload.

**Non-Goals:**

- No switch for the public `departure` / `arrival` channel announcements — those are not private messages and stay unconditional.
- No new weather provider, no new fetch path, and no snapshotting of the OFP PDF (see the existing decision to attach the live SimBrief URL).
- No retry or queue for undelivered briefings.

## Decisions

**A dedicated `discord-settings` resource rather than a field on the profile.** `GET` and `PATCH /api/v1/user/me/discord-settings` return the same settings object. The alternative — another optional boolean on `UpdateOwnProfileDto` next to `defaultWeatherSource` — is cheaper today but mixes an integration preference into the identity payload and gives later Discord settings nowhere natural to live. The endpoint pair is one action class each, matching the one-controller-per-endpoint rule, and the `PATCH` follows the established write-then-read shape.

**Preference stored as a single non-null boolean column defaulting to `true`.** `User.discordBriefingsEnabled Boolean @default(true)` keeps existing pilots on today's behaviour with no backfill and no nullable tri-state to interpret. Modelling it as a JSON settings blob was rejected: one boolean does not justify losing column-level typing and validation.

**The setting is checked before the Discord id.** Both are read through the query bus from the users module; a disabled pilot short-circuits before any flight, OFP or weather read, so switching briefings off also removes their cost.

**Weather is read, and refreshed only if the read comes back empty.** The briefing dispatches `GetAirportWeatherQuery` for the departure airport with the `all` source filter. If no report exists — the normal case the first time anyone flies out of that airport, because the concurrent weather listener has not finished — the briefing dispatches `RefreshWeatherCommand([departureAirportId])` once and re-reads. Alternatives rejected: ordering the listeners (EventEmitter2 offers no priority that would help, and coupling two modules through listener order is fragile), and always refreshing (doubles the provider calls for every check-in).

**Per information type, the pilot's preferred provider wins, otherwise any provider does.** METAR and TAF exist from both providers, so the pilot's `defaultWeatherSource` selects between them; ATIS exists from SayIntentions only, so a pilot defaulting to aviationweather.gov still gets it through the fallback. Filtering the query by the user default instead would silently drop ATIS for most pilots.

**Briefing text lives in a pure formatter module.** `DiscordService` gathers flight, OFP, weather and preference, then hands a plain input object to a formatter that returns the message body. The formatter is covered by its own colocated Jest spec, so the section-omission rules and the schedule and block-time formatting are tested without mocking a bus.

**Block time is formatted separately from `calculateBlockTime`.** The existing helper returns `HH:MM` and is used by the channel announcements; the briefing needs `3h 40m`, so it gets its own formatter rather than a changed shared one.

## Risks / Trade-offs

- **The weather fallback adds a synchronous provider round-trip to the briefing path** → it runs only when nothing is stored, is already wrapped in the listener's try/catch, and the check-in response does not wait on message delivery outcomes beyond the awaited event.
- **The briefing races the weather listener, so a stored-but-stale report may be used instead of the fresh one being written concurrently** → acceptable: reports are refreshed every five minutes anyway, so the worst case is a briefing minutes behind.
- **`TestDiscordClient` keys files by `<type>_<flightId>`, so a re-check-in overwrites the previous briefing file** → unchanged from today, and each functional scenario resets the directory.
- **A longer message risks Discord's 2000-character limit when ATIS and TAF are both long** → ATIS text from SayIntentions is the only unbounded field; if a briefing is rejected the existing catch logs a warning and the check-in is unaffected.

## Migration Plan

One additive column with a default; no backfill and no data migration. Existing pilots keep receiving briefings. Rollback is dropping the column and reverting the message body — no other module reads the new field.
