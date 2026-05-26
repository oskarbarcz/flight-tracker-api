import { After, Given, Then, When } from '@cucumber/cucumber';
import expect from 'expect';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';
import { deepCompare } from '../_helper/deep-compare';

type WebsocketRole =
  | 'admin'
  | 'operations'
  | 'cabin crew'
  | 'no-token'
  | 'invalid-token';

const apiBaseUrl = 'http://localhost:3000';
const namespaceUrl = `${apiBaseUrl}/flight-events`;

const credentials: Record<string, { email: string; password: string }> = {
  admin: { email: 'admin@example.com', password: 'P@$$w0rd' },
  operations: { email: 'operations@example.com', password: 'P@$$w0rd' },
  'cabin crew': { email: 'cabin-crew@example.com', password: 'P@$$w0rd' },
};

const sockets: Socket[] = [];

type ReceivedEvents = {
  history: unknown[];
  historyReceived: boolean;
  events: unknown[];
  disconnected: boolean;
  connectError: Error | null;
};

let received: ReceivedEvents = {
  history: [],
  historyReceived: false,
  events: [],
  disconnected: false,
  connectError: null,
};

let socket: Socket | null = null;

async function signIn(
  role: 'admin' | 'operations' | 'cabin crew',
): Promise<string> {
  const response = await axios.post(
    `${apiBaseUrl}/api/v1/auth/sign-in`,
    credentials[role],
  );
  return (response.data as { accessToken: string }).accessToken;
}

function trackSocket(s: Socket): void {
  sockets.push(s);
  socket = s;
  s.on('flight.events', (payload: unknown[]) => {
    received.history = payload;
    received.historyReceived = true;
  });
  s.on('flight.event', (payload: unknown) => {
    received.events.push(payload);
  });
  s.on('disconnect', () => {
    received.disconnected = true;
  });
  s.on('connect_error', (err: Error) => {
    received.connectError = err;
  });
}

async function waitFor(
  predicate: () => boolean,
  timeoutMs = 2000,
): Promise<void> {
  const start = Date.now();
  while (!predicate()) {
    if (Date.now() - start > timeoutMs) {
      throw new Error(`Timed out waiting for condition after ${timeoutMs}ms`);
    }
    await new Promise((r) => setTimeout(r, 25));
  }
}

Given(
  'I open a WebSocket connection as {string}',
  async (role: WebsocketRole) => {
    let token: string | undefined;
    if (role === 'no-token') {
      token = undefined;
    } else if (role === 'invalid-token') {
      token = 'not-a-real-jwt';
    } else {
      token = await signIn(role);
    }

    const s = io(namespaceUrl, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
      auth: token ? { token } : {},
    });
    trackSocket(s);

    await new Promise<void>((resolve) => {
      s.once('connect', () => resolve());
      s.once('connect_error', () => resolve());
      s.once('disconnect', () => resolve());
    });
  },
);

When('I subscribe to flight events for {string}', async (flightId: string) => {
  if (!socket) throw new Error('No active WebSocket connection');
  socket.emit('subscribe', { flightId });
});

When(
  'I unsubscribe from flight events for {string}',
  async (flightId: string) => {
    if (!socket) throw new Error('No active WebSocket connection');
    socket.emit('unsubscribe', { flightId });
    // small delay so the server processes leave before any subsequent broadcast
    await new Promise((r) => setTimeout(r, 50));
  },
);

Then(
  'I should receive flight event history within {int}ms',
  async (timeoutMs: number) => {
    await waitFor(() => received.historyReceived, timeoutMs);
  },
);

Then(
  'the received flight event history should contain:',
  async function (docString: string) {
    const expected = JSON.parse(docString);
    deepCompare(received.history, expected);
  },
);

Then(
  'I should receive a live flight event of type {string} within {int}ms',
  async (type: string, timeoutMs: number) => {
    await waitFor(
      () => received.events.some((e) => (e as { type?: string }).type === type),
      timeoutMs,
    );
  },
);

Then(
  'I should not receive any live flight event within {int}ms',
  async (timeoutMs: number) => {
    await new Promise((r) => setTimeout(r, timeoutMs));
    expect(received.events).toEqual([]);
  },
);

Then(
  'the WebSocket connection should be rejected within {int}ms',
  async (timeoutMs: number) => {
    await waitFor(
      () => received.disconnected || received.connectError !== null,
      timeoutMs,
    );
    expect(socket?.connected).toBe(false);
  },
);

After(() => {
  for (const s of sockets) {
    s.removeAllListeners();
    if (s.connected) s.disconnect();
  }
  sockets.length = 0;
  socket = null;
  received = {
    history: [],
    historyReceived: false,
    events: [],
    disconnected: false,
    connectError: null,
  };
});
