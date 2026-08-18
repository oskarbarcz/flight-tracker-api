## Context

See `proposal.md` § Why for motivation and `specs/discord-rich-presence/spec.md` for the
behaviour contract.

Four pieces of current state shape the approach:

**Discord rich presence is written locally, not pushed.** Every other Discord feature in
the system sends a message through the bot or the REST client. An activity is different:
it is set over Discord's local IPC socket by a process on the user's own machine. The API's
only possible role is to say _what_ to publish.

**The user already carries their current flight.** `User.currentFlightId` is maintained by
the flight lifecycle, so "the flight this pilot is on" needs no search and no new column.

**The Discord settings pair already exists.** `GET`/`PATCH /api/v1/user/me/discord-settings`
were added with the briefing switch and already handle a partial patch that leaves unnamed
settings alone, so a new switch is one column, one DTO property and one model field.

**Flight timesheets are layered.** `FullTimesheet` carries `scheduled` (published) and
`estimated` (entered by the crew at check-in), with the estimate being the more accurate
picture once it exists.

## Goals / Non-Goals

**Goals:**

- Give the companion a payload it can hand to Discord field-for-field, with no product
  decisions left in the desktop app.
- Say "nothing to publish" unambiguously, in a way a polling client can act on without
  parsing a body.
- Default the switch off.

**Non-Goals:**

- Publishing the activity from the server. Not possible — see Context.
- A WebSocket or push channel for presence. The companion polls; an activity that is a
  minute stale is indistinguishable from a fresh one, because the two timestamps let
  Discord animate the elapsed and remaining time on its own.
- Presence for a flight the pilot has not checked in for. Without a flight there is no
  route, no schedule and no phase — nothing to say.
- Server-side knowledge of whether the companion is running or whether Discord accepted
  the activity.

## Decisions

### `GET /api/v1/user/me/discord-presence` answers `204` when there is nothing to publish

The action returns the presence body with `200`, or sets `204` and returns nothing when the
query resolves to null — which happens when the setting is off, the user has no current
flight, or the flight lacks a departure or destination airport.

_Why:_ the companion polls this endpoint on a timer. `204` is a single unambiguous "clear
the activity" signal it can act on without inspecting a body, and it collapses three
different reasons into the one instruction that matters locally. A `404` would suggest the
endpoint or the user is wrong; a `200` with nulls would make every field optional for the
sake of the empty case.

_Consequence:_ the companion cannot tell _why_ nothing is published. Deliberate — the
reasons are the pilot's own settings and flight state, which the app already shows them.

### The API renders both display strings

`state` is `"Cruise, landing at 13:30 UTC"`; `details` is `"Barcelona (BCN) -> New York (JFK)"`.

_Why:_ these are product copy. Rendering them server-side means a wording change ships with
the API rather than waiting for every pilot to update a desktop application, and it keeps
the status vocabulary identical to the rest of the product. The companion stays a
transport.

_Consequence:_ the strings are English and unlocalised, matching every other user-facing
string the API produces today.

### The next-due time is chosen by phase

Before takeoff — `created` through `taxiing_out` — the state names the takeoff time; in
cruise it names the landing time; from `taxiing_in` onwards it is the status label alone.
A time that is not known yet is omitted rather than shown empty.

_Why:_ a rich presence line has room for one time, and the useful one is whatever the flight
is waiting for. Once the aircraft is on the ground nothing is pending that a friend reading
the profile would care about, so the label stands alone.

### Timestamps come from the estimate, falling back to the schedule

`startTimestamp` is the off-block time and `endTimestamp` the landing time, taken from
`timesheet.estimated` when it exists and from `timesheet.scheduled` otherwise.

_Why:_ Discord counts up from a start and down to an end, so both must be the best times
known. The crew's estimate supersedes the published schedule the moment it is entered at
check-in; before that the schedule is all there is. Both are nullable in the payload so a
flight with neither still publishes its route and state.

### The switch defaults to off

`user.discordRichPresenceEnabled Boolean @default(false)`.

_Why:_ every other Discord setting governs a message the pilot receives, and defaulting
those on is a service to them. This one publishes what they are doing to everyone who can
see their profile. Opting a pilot into that silently is not the same kind of decision, so
the default inverts.

_Consequence:_ the "every setting defaults to enabled" claim in the briefing spec stops
being true and is modified there.

### The presence is composed in the model layer, from a narrow input type

`buildDiscordPresence(flight)` is a pure function in `model/discord-presence.model.ts`
taking a `PresenceFlight` — status, timesheet and airports only — and the query resolves
the flight through `GetFlightQuery` on the bus.

_Why:_ the formatting rules (labels, phase choice, route wording) are worth unit-testing
directly, and a pure function over a narrow structural type tests without a database or a
bus. Reading the flight through the query bus keeps the cross-module read on the bus rather
than reaching into the flights module's repositories.

## Risks / Trade-offs

**Polling cost** → one authenticated read per companion per interval, answered from the
user row and a flight read that is already cached. Acceptable; a push channel can be added
later without changing the payload.

**Asset keys are hard-coded** → `smallImageKey` is `flight-tracker` and `largeImageKey` is
`msfs 2024`, matching the assets registered on the Discord application. They are returned
rather than assumed by the companion so a rename ships from the API, but the values
themselves live in code. The small-image key deliberately keeps the pre-rebrand name,
because it is the identifier of an asset already uploaded to Discord.

**A stale flight body** → the presence reads the flight through the cached flight query, so
a phase change can take up to the cache TTL to appear in the activity. Tolerable for a
profile line; the same event invalidates that cache entry anyway.

## Migration Plan

1. Add `discordRichPresenceEnabled Boolean @default(false)` to `model User`, write the
   migration by hand (`ALTER TABLE "user" ADD COLUMN … DEFAULT false`), and push the schema
   to the dev database.
2. Seed the column explicitly as `false` on every seeded user so the settings and presence
   scenarios start from a known state.
3. Add the setting to the repository read/write, the settings model and the patch DTO.
4. Add the presence model, query, action and module wiring.

**Rollback:** dropping the endpoint leaves the column unused with a `false` default;
nothing else reads it, and no external state was written.
