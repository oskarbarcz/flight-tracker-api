# WebSockets

In addition to the REST API, the server exposes a Socket.IO namespace at `/flight-events` for receiving flight
lifecycle events as they happen. Clients (cabin-crew tablets, operations consoles) should subscribe instead of
polling `GET /api/v1/flight/:id/events`.

## Connect

- URL: `ws://localhost/flight-events` (production: `wss://api.mypreflight.io/flight-events`)
- Auth: pass a JWT access token in the Socket.IO `auth.token` handshake field. The same token issued by
  `POST /api/v1/auth/sign-in` is accepted. Connections without a valid token, or with a role other than `CabinCrew`
  or `Operations`, are disconnected immediately.

## Messages the client send

| Event         | Payload                | Effect                                                                                                            |
| ------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `subscribe`   | `{ flightId: string }` | Join the per-flight room and receive the historical event stream then live updates. `flightId` must be a UUID v4. |
| `unsubscribe` | `{ flightId: string }` | Leave the room. The server stops emitting events for that flight on this socket.                                  |

## Messages the server emits

| Event                    | Payload                 | Notes                                                                                                                              |
| ------------------------ | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `flight.events`          | `FlightEventResponse[]` | Initial history replay sent once per `subscribe`, ordered by `createdAt` ascending. Same shape as `GET /api/v1/flight/:id/events`. |
| `flight.event`           | `NewFlightEvent`        | Live lifecycle event broadcast to all sockets subscribed to that flight room.                                                      |
| `flight.subscribe.error` | `{ flightId, message }` | Emitted when `subscribe` cannot be fulfilled (e.g. the flight ID does not exist).                                                  |

Any event emitted by the domain that `EventsRepository` persists (boarding started/finished, off-block, takeoff,
arrival, on-block, offboarding, close, gate/runway/timesheet/loadsheet changes, emergencies, track
saves, live positions) is forwarded as a `flight.event` to subscribers of the matching flight.

## Browser example

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