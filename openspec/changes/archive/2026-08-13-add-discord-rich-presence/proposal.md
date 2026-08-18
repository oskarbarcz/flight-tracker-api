## Why

A pilot's Discord profile is where their friends see what they are doing, and Discord will
show a flight there as a rich presence activity — but only if something writes it from the
machine the pilot is flying on. Discord's activity API is local: it talks to the Discord
client running next to the simulator, not to a server. The API therefore cannot publish a
pilot's flight itself no matter how much it knows about it, which is why pilots who turn
rich presence on today see nothing.

The desktop companion (issue #220) is the piece that runs on that machine. What it lacks
is the flight, rendered the way Discord wants it: two short lines of text plus the two
timestamps Discord counts from and down to. Working that out is not the companion's
business — the status labels, the route wording and the choice between crew estimates and
the published schedule are all product decisions, and duplicating them in a desktop app
that ships on its own release cycle would guarantee the two drift apart.

## What Changes

- Add `GET /api/v1/user/me/discord-presence`, returning the activity the signed-in user
  currently wants published: the flight's state line, its route line, the off-block and
  landing timestamps, and the two Discord asset keys.
- Answer no content — rather than an error or an empty object — when there is nothing to
  publish: rich presence is off, the user is not on a flight, or the flight has no
  departure or destination airport.
- Add `richPresenceEnabled` to the Discord settings pair, defaulting to **off**. It is the
  first setting in that group that does not default to on, because publishing a pilot's
  activity outside the app is not something to opt them into silently.
- Compose the state line from the flight's status and the next time it is due: before
  takeoff the takeoff time, in cruise the landing time, afterwards the status alone.
- Prefer the crew's estimated timesheet over the published schedule, falling back when no
  estimate exists.

## Capabilities

### New Capabilities

- `discord-rich-presence`: the per-pilot switch, the presence read, and the content of the
  published activity.

### Modified Capabilities

- `discord-flight-briefing`: the settings-read requirement no longer claims that every
  Discord setting defaults to enabled, since rich presence defaults to off.

## Impact

- **API**: one new endpoint, `GET /api/v1/user/me/discord-presence`, answering `200` or
  `204`; one new optional boolean on `PATCH /api/v1/user/me/discord-settings` and one new
  field on its read.
- **Data**: `user.discordRichPresenceEnabled`, defaulting to `false` for existing rows.
- **Integrations**: none. The API renders the activity; the companion publishes it. Nothing
  in this change talks to Discord.
- **Code**: `users` module — a presence query, a presence action, the presence model with
  its formatting rules, and three settings touchpoints (model, DTO, repository).
- **Tests**: a colocated Jest spec for the presence formatting, a functional feature for
  the endpoint, and the new setting swept into the Discord settings feature.
- **Docs**: README Discord section.
