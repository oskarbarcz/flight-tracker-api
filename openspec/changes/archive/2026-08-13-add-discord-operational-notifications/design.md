## Context

See `proposal.md` — Why. The briefing change left a structure to extend rather than invent:

- Three single-purpose listeners under `flights/application/event/internal/` each gather data, call a pure formatter in `flights/model/discord-message.formatter.ts`, and send through `DiscordClient`, swallowing failures.
- `User.discordBriefingsEnabled` is read by `GetUserDiscordSettingsQuery`, and `GET`/`PATCH /api/v1/user/me/discord-settings` carry it.
- `DiscordMessageType` is a closed union (`'arrival' | 'departure' | 'briefing'`), and `DiscordDirectMessage` narrows to `type: 'briefing'`.

Four facts about the events shape the design. `BoardingWasStarted` and `BoardingWasFinished` carry only the base payload. `DelayRequestWasCreated` is raised by `OffBlockDelayListener` with `actorId: null` — nobody triggered it. `DelayReportWasAccepted` carries the **operations** user as `actorId`, not the pilot. And the flight read model returned by `GetFlightQuery` does not expose `captainId`.

## Goals / Non-Goals

**Goals:**

- One listener per message, continuing the split the briefing change ended on.
- One place that decides "may this user be messaged about this", so five listeners do not each re-implement it.
- Settings that grow without reshaping the resource each time a message is added.

**Non-Goals:**

- No switch for the public `departure` / `arrival` channel announcements — they are not private messages.
- No message on delay rejection, on `DelayReportWasFiled`, or on any other lifecycle event not named in the proposal.
- No change to who receives the check-in briefing: it keeps going to the actor who checked in.

## Decisions

**Recipient is the flight's captain, resolved from the flight, not from the event.** Neither delay event names the pilot — one has no actor, the other has the operations approver — so `actorId` cannot be the recipient. Reading the captain from the flight is the only rule that holds for all four messages, and it matches the intent: these concern whoever is flying the sector. `FlightsRepository` gains `getCaptainId(flightId)`; the listeners inject the repository directly, as `OffBlockDelayListener` already does with `DelayRepository`. Exposing `captainId` on the public flight DTO was rejected — it would change every full-body flight assertion for an internal need.

**One query answers "who do I message about this", replacing a per-listener preamble.** `GetDiscordRecipientQuery(userId, notification)` lives in the users module — which owns both the linked account and the preferences — and returns the Discord id when that user has the account linked _and_ that notification enabled, otherwise `null`. Each listener makes one bus call instead of repeating a settings read, a flag check, an id read and a null check five times. The alternative, a shared resolver injected into the listeners, would have needed a new folder in the module layout or an application-to-infra import.

**Settings are flat boolean columns, and `PATCH` becomes partial.** Four `Boolean @default(true)` columns on `User` keep column-level typing and need no backfill; a JSON blob was rejected for losing both. With several fields, a mandatory-field `PATCH` would force clients to echo settings they are not changing, so every field becomes optional and only the named ones are written. That relaxes today's contract rather than breaking callers.

**A `DiscordNotification` enum names each _switch_, not each message.** One enum value per independently toggleable kind, mapping to a settings field. The two delay messages share `DelayUpdates` — a pilot who does not want to be asked to allocate does not want the approval either — while keeping distinct `DiscordMessageType`s on the wire, so they still land in separate files and separate Discord messages. Adding another switchable message means one enum value, one column, one formatter and one listener — and the compiler finds the places that must change.

**Both loadsheets share one formatter, parameterised by which one it is.** Preliminary and final carry identical figures and differ only in title and timing; two formatters would be the same function twice. The crew list is passed in already resolved, so the formatter stays pure.

**Crew names come from the crew module over the bus.** `ListFlightCrewQuery` already returns each member's name and role, so the loadsheet listeners dispatch it rather than reading `CrewOnFlights` themselves. A flight with no assigned crew simply omits the section, exactly as the briefing omits weather it does not hold.

## Risks / Trade-offs

- **Boarding start now triggers two listeners — the public announcement and the loadsheet DM** → they are independent, each with its own try/catch, so one failing does not affect the other or the boarding action.
- **The per-message columns on `User` will keep growing as messages are added** → accepted while the count is small; if it reaches the point of being unwieldy the set moves to its own table without changing the endpoint contract, which is why the settings live behind their own resource.
- **A pilot who checks in, then has boarding started by someone else, still gets the loadsheet** → correct: the captain is the one who needs the load figures, whoever pressed the button.
- **`DelayReportWasAccepted` fires per report, so a delay allocated across several reports confirms several times** → acceptable; each acceptance is a real decision the pilot wants to see, and the flight is only settled once all reports are accepted.

## Migration Plan

Three additive columns with defaults, alongside the existing one; no backfill. Every pilot keeps receiving everything until they opt out. Rollback is dropping the columns and removing the four listeners — the briefing path does not depend on them.
