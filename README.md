![My Project Header](.github/image/header.png)

# Flight Tracker

A comprehensive web app for scheduling and tracking flights in a flight simulator environment. Designed for virtual
aviation enthusiasts, it enables seamless management of flights, aircraft, airports, crews and passengers.

With this app, you can:

- Plan & manage flights with detailed flight plans
- Track flights step-by-step from departure to arrival
- Generate timesheets & loadsheets for accurate record-keeping
- Monitor aircraft status and optimize resource allocation

Take full control of your virtual airline operations with a realistic and structured workflow for flight simulation.

This is the server part of the project. For the client part, please visit
[this repository](https://github.com/oskarbarcz/flight-tracker-app).

## Repository contents

Repository contains server code for [the Flight Tracker](https://flights.barcz.me) app.

Project is using **Node.js** and **TypeScript** as the main technology.

## Getting Started

### Environment

This app uses docker-based virtualization to run. To set up the project, follow these steps:

1. Clone the project by running:

   ```shell
   git@github.com:oskarbarcz/flight-tracker-api.git
   ```

2. Prepare an environment variable file by copying `.env.example` to `.env` and fill it with your data.

   ```shell
   cd flight-tracker-api
   cp .env.dist .env
   ```

3. Use docker compose to set up the environment

   ```shell
   docker compose up -d --build
   ```

   Packages, database schema, seed data will be configured automatically.

4. Your project should be up and running. Open the browser and go to [http://localhost/api](http://localhost/api) to see the
   api documentation.
   The seeded API users (all share the password `P@$$w0rd`) are:
   | Name | Role | Username | Notes |
   | ----------- | ---------- | ----------------------- | ---------------------------------------------------- |
   | John Doe | Admin | admin@example.com | |
   | Alice Doe | Operations | operations@example.com | |
   | Abby Doe | Operations | abby.doe@example.com | SimBrief connected (valid flight plan) |
   | Claudia Doe | Operations | claudia.doe@example.com | SimBrief connected (plan references unknown aircraft) |
   | Diana Doe | Operations | diana.doe@example.com | SimBrief connected (plan references unknown alternate) |
   | Rick Doe | Cabin crew | cabin-crew@example.com | |
   | Alan Doe | Cabin crew | alan.doe@example.com | |
   | Michael Doe | Cabin crew | michael.doe@example.com | Discord linked — receives briefing DMs |
   | Grace Doe | Operations | grace.doe@example.com | Google-only — no password; Discord linked, so it cannot be unlinked either |

### WebSocket flight events

In addition to the REST API, the server exposes a Socket.IO namespace at `/flight-events` for receiving flight
lifecycle events as they happen. Clients (cabin-crew tablets, operations consoles) should subscribe instead of
polling `GET /api/v1/flight/:id/events`.

**Connect**

- URL: `ws://localhost/flight-events` (production: `wss://api.flights.barcz.me/flight-events`)
- Auth: pass a JWT access token in the Socket.IO `auth.token` handshake field. The same token issued by
  `POST /api/v1/auth/sign-in` is accepted. Connections without a valid token, or with a role other than `CabinCrew`
  or `Operations`, are disconnected immediately.

**Messages the client sends**

| Event         | Payload                | Effect                                                                                                            |
| ------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `subscribe`   | `{ flightId: string }` | Join the per-flight room and receive the historical event stream then live updates. `flightId` must be a UUID v4. |
| `unsubscribe` | `{ flightId: string }` | Leave the room. The server stops emitting events for that flight on this socket.                                  |

**Messages the server emits**

| Event                    | Payload                 | Notes                                                                                                                              |
| ------------------------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `flight.events`          | `FlightEventResponse[]` | Initial history replay sent once per `subscribe`, ordered by `createdAt` ascending. Same shape as `GET /api/v1/flight/:id/events`. |
| `flight.event`           | `NewFlightEvent`        | Live lifecycle event broadcast to all sockets subscribed to that flight room.                                                      |
| `flight.subscribe.error` | `{ flightId, message }` | Emitted when `subscribe` cannot be fulfilled (e.g. the flight ID does not exist).                                                  |

Any event emitted by the domain that `EventsRepository` persists (boarding started/finished, off-block, takeoff,
arrival, on-block, offboarding, close, gate/runway/timesheet/loadsheet changes, emergencies, track
saves, live positions) is forwarded as a `flight.event` to subscribers of the matching flight.

**Browser example**

```ts
import { io } from 'socket.io-client';

const socket = io('http://localhost/flight-events', {
  auth: { token: accessToken },
  transports: ['websocket'],
});

socket.on('flight.events', (history) => console.log('history', history));
socket.on('flight.event', (event) => console.log('live', event));
socket.on('flight.subscribe.error', (err) => console.error(err));

socket.emit('subscribe', { flightId: '3c8ba7a7-1085-423c-8cc3-d51f5ab0cd05' });
```

### Email

Outbound email needs `MAILGUN_API_HOST`, `MAILGUN_DOMAIN`, `MAILGUN_API_KEY`, `MAIL_FROM_ADDRESS` and
`FRONTEND_BASE_URL` (the base URL that links in emails point at). `.env.dist` ships working development placeholders.

Only `NODE_ENV=production` sends anything. Everywhere else each message is written to
`test-data/mail/<type>_<recipient>_<uuid>.json` instead.

### Discord

The same Discord application does two jobs: a **bot** that sends messages over the gateway, and an **OAuth client**
that proves a user owns a Discord account. Both read `DISCORD_APP_TOKEN` (bot token) and `DISCORD_SERVER_ID` (the
guild the app is installed in).

**Sending.** The bot needs `DISCORD_PUBLIC_FLIGHT_ANNOUNCEMENTS_CHANNEL_ID` and sends two kinds of message:

- a public announcement in the announcements channel when boarding starts and when a flight goes on block;
- a direct message with the flight briefing to the pilot who checks in.

**The briefing.** It names the flight, its route and its aircraft, then renders the estimated schedule as an
`out`/`off`/`on`/`in` block with the resulting block time, followed by the ATIS, METAR and TAF held for the
**departure** airport. Each report is reproduced exactly as its provider published it, and a report the system does
not hold is left out rather than shown empty — ATIS comes from SayIntentions only, so a briefing may well have none.
A flight imported from SimBrief also carries its OFP as both a link and an attachment. The closing link is built
from `FRONTEND_BASE_URL`.

Weather is read from the reports already stored for the airport. Check-in also starts a weather refresh in its own
listener, and the two run concurrently, so when nothing is stored yet the briefing runs one refresh of the departure
airport itself before giving up on a section. Briefing delivery never blocks a check-in: a rejected message is
logged and swallowed.

`NODE_ENV=production` connects to the gateway, and so does `DISCORD_GATEWAY_ENABLED="true"` anywhere else — the
escape hatch for working against a real server locally. With neither, the connection is refused outright.
Message delivery is gated separately on `NODE_ENV`: outside production every message is written to
`test-data/discord/<type>_<flightId>.md` instead of being sent, so no test run can post to a real server.

The client requests the `Guilds`, `Guild Members`, `Guild Messages`, `Direct Messages` and `Message Content`
intents. `Guild Members` and `Message Content` are privileged and must be enabled for the application in the
developer portal or `login()` is rejected. Only `Guilds` and `Guild Members` are needed to send — the other three
are held for receiving from Discord and can be dropped until something listens.

**Identity.** Linking and Discord sign-in need `DISCORD_CLIENT_ID` (the application ID — the same number the bot
token encodes), `DISCORD_CLIENT_SECRET` and `DISCORD_OAUTH_REDIRECT_URIS`, a comma-separated allowlist of callback
URIs. `DISCORD_API_HOST` overrides the Discord REST host and points at the `discord-mock` container locally; leave
it unset in production to reach `https://discord.com/api`. Register every callback URI in the developer portal
exactly as it appears in the allowlist, and give the bot **Create Invite** in the server or `guilds.join` is refused.

Discord issues no browser-side ID token, so unlike Google Sign-In the frontend redirects the whole page and hands
the resulting `code` to the API, which performs the `client_secret` exchange. The frontend generates the PKCE
verifier and `state`, and the API validates `redirectUri` against the allowlist before the exchange — an
unlisted URI is rejected with `400` so a code cannot be relayed elsewhere.

| Endpoint                                        | Purpose                                                                                                                              |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `POST /api/v1/auth/discord`                     | Sign in. Resolves the user by `discordId` only; an unlinked account is `401` and no account is ever created.                         |
| `POST /api/v1/user/me/link-discord-account`     | Link, optionally joining the server in the same consent pass (`joinServer`). Returns the resulting state so the UI needs no refetch. |
| `POST /api/v1/user/me/unlink-discord-account`   | Unlink. Requires the current password, and never removes the user from the server.                                                   |
| `GET /api/v1/user/me/discord/server-membership` | Live membership probe for an account screen.                                                                                         |
| `GET /api/v1/user/me/discord-settings`          | Read whether check-in briefing direct messages are enabled.                                                                          |
| `PATCH /api/v1/user/me/discord-settings`        | Turn briefing direct messages on or off. Defaults to on, and works with or without a linked account.                                 |

**Server membership is a precondition, not a detail.** A direct message can only reach somebody who shares the
server with the bot, so a linked account that never joined gets no briefings — as does a pilot who turned them off
in `discord-settings`. `joinServer: true` adds the user
during linking; when that fails the link still stands and `joinOutcome` reports `failed`, because a link is worth
keeping on its own. Membership is reported as `member`, `not_member` or `unknown` — and `unknown` whenever the truth
could not be established (no linked account, gateway offline, or Discord silent), never `not_member`. With the
gateway off, the seeded membership scenarios therefore expect `unknown`; enabling `DISCORD_GATEWAY_ENABLED`
locally makes them probe the real server and report `not_member` for the seeded fixture accounts.

No Discord OAuth token is stored. The server join happens inside the link request while the access token is in
memory, and the token is discarded with it; joining later means re-linking or using an invite. `GET /api/v1/user/me`
reports both providers under `identities` from stored fields alone and contacts nobody.

`discordId` cannot be set through `PATCH /api/v1/user/me` — it authenticates Discord sign-in, so only a completed
OAuth exchange may write it.

### Generating certs

Application has by default configured EC certificates. However, if you want to create custom ones, use the command
below:

```shell
openssl ecparam -genkey -name prime256v1 -noout -out private.key
openssl ec -in private.key -pubout -out public.key
```

## Build, test and deploy

This project uses [semantic versioning](https://semver.org/spec/v2.0.0.html).

This project has configured continuous integration and continuous deployment pipelines. It uses GitHub Actions to
automatically build, test and deploy the app to the DigitalOcean. You can find the configuration in `.github/workflows`
directory.

## License

This project adapts UNLICENSE. For more information, please refer to the [UNLICENSE](UNLICENSE) file.

## Disclaimer

I am an experienced software engineer, but I am not connected anyhow with the airline industry. This project is created
for educational purposes only and should not be used for real-world aviation operations.
