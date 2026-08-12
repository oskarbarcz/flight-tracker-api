## Why

A pilot who checks in for a flight currently has to open the app, the OFP and a weather site separately to build a picture of the sector ahead. The system already knows the route, the aircraft, the estimated schedule, the SimBrief flight plan and the departure airport weather at the moment of check-in, so it can deliver a single ready-to-read briefing straight to the pilot's Discord private messages. Because a private message is intrusive, the pilot must also be able to switch it off.

## What Changes

- On check-in, a pilot with a linked Discord account receives a private message containing the flight briefing: flight number, route, aircraft, the estimated schedule as an out/off/on/in block with total block time, and the departure airport's ATIS, METAR and TAF.
- The briefing closes with a link back to the flight in the app.
- When the flight was imported from SimBrief, the operational flight plan PDF is attached to the message and linked in its body.
- Sections whose data is unavailable (no ATIS published, no SimBrief plan) are omitted rather than shown empty.
- A pilot can turn briefing private messages on or off. The setting is read and written through a dedicated Discord settings endpoint pair on the signed-in user, and defaults to on.
- Briefings are only sent to pilots who have a linked Discord account and have not switched the setting off.

## Capabilities

### New Capabilities

- `discord-flight-briefing`: delivery of the check-in flight briefing as a Discord private message, its content, and the per-pilot switch that enables or disables it.

### Modified Capabilities

<!-- None: the existing discord-account-link, discord-sign-in and discord-server-membership specs are unaffected. -->

## Impact

- **API**: new `GET /api/v1/user/me/discord-settings` and `PATCH /api/v1/user/me/discord-settings`.
- **Data**: new per-user briefing preference, defaulting to enabled for existing pilots.
- **Behaviour**: the check-in briefing private message that exists today is replaced by the richer content described above and becomes conditional on the new setting.
- **Integrations**: reuses the stored airport weather (ATIS from SayIntentions, METAR/TAF from aviationweather.gov) already refreshed at check-in, and the SimBrief operational flight plan already stored at import.
- **Docs**: README Discord section.
