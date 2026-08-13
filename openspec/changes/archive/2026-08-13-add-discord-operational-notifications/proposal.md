## Why

The check-in briefing proved that a pilot will read what the system pushes to them. The rest of a flight's operational moments still require opening the app to discover: that boarding numbers are ready, that the final load has been signed off, that a departure delay is waiting to be allocated, and that operations has accepted the allocation. Each of those is a moment where the pilot must act or wants confirmation, and the system already knows all of it.

## What Changes

- On boarding start, the pilot receives the preliminary loadsheet as a private message: the named crew assigned to the flight with their roles, plus passengers, cargo, payload, zero fuel weight and block fuel.
- On boarding finish, the pilot receives the final loadsheet in the same shape.
- When a departure delay is raised for a flight, the pilot receives the delay and a link to allocate it.
- When operations accepts a delay report, the pilot is told the allocation was approved.
- Each of the four is separately switchable, alongside the existing briefing switch, through the Discord settings endpoints. All default to on.
- **BREAKING**: `PATCH /api/v1/user/me/discord-settings` becomes a partial update — every field is now optional, so a caller may send only the setting it changes. Sending only `briefingsEnabled` keeps working; a request that previously relied on it being mandatory no longer fails.

## Capabilities

### New Capabilities

- `discord-flight-notifications`: the loadsheet and delay private messages, who receives them, and what each one carries.

### Modified Capabilities

- `discord-flight-briefing`: the per-pilot switch grows from one briefing flag into a set of independent per-message flags, and the settings resource that carries them changes shape.

## Impact

- **API**: `GET` / `PATCH /api/v1/user/me/discord-settings` gain four fields; `PATCH` accepts partial payloads.
- **Data**: four more per-user boolean preferences, each defaulting to enabled, so nobody has to opt in.
- **Behaviour**: four new private messages on existing lifecycle events. The public boarding and arrival channel announcements are untouched and stay unconditional.
- **Integrations**: the Discord message-type union widens; outside production each new message lands in `test-data/discord/` under its own type.
- **Docs**: README Discord section.
