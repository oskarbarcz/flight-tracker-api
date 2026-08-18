import { SimbriefClient } from './simbrief.client';
import {
  SimbriefUnavailableError,
  SimbriefUserNotFoundError,
} from '../error/simbrief.error';

const UNKNOWN_USER_BODY = {
  fetch: {
    userid: '999999999',
    static_id: '',
    status: 'Error: Unknown UserID',
    time: '0.0002',
  },
};

const PLAN_BODY = {
  fetch: { userid: '987654', status: 'Success' },
  general: { icao_airline: 'DLH', flight_number: '0400' },
};

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('SimbriefClient', () => {
  const originalFetch = global.fetch;

  function answerWith(response: () => Promise<Response>): SimbriefClient {
    global.fetch = jest.fn(response) as unknown as typeof fetch;

    return new SimbriefClient('http://simbrief.test');
  }

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('reads the flight plan Simbrief answers with', async () => {
    const client = answerWith(() =>
      Promise.resolve(jsonResponse(PLAN_BODY, 200)),
    );

    await expect(client.findOperationalFlightPlan('987654')).resolves.toEqual(
      PLAN_BODY,
    );
  });

  it('reports an unknown user ID as no plan', async () => {
    const client = answerWith(() =>
      Promise.resolve(jsonResponse(UNKNOWN_USER_BODY, 400)),
    );

    await expect(
      client.findOperationalFlightPlan('999999999'),
    ).resolves.toBeNull();
  });

  it('reports an unknown user ID answered with a success status code as no plan', async () => {
    const client = answerWith(() =>
      Promise.resolve(jsonResponse(UNKNOWN_USER_BODY, 200)),
    );

    await expect(
      client.findOperationalFlightPlan('999999999'),
    ).resolves.toBeNull();
  });

  it('refuses to read a plan Simbrief did not fetch', async () => {
    const client = answerWith(() =>
      Promise.resolve(
        jsonResponse({ fetch: { status: 'Error: No flight plan' } }, 200),
      ),
    );

    await expect(client.findOperationalFlightPlan('987654')).rejects.toThrow(
      SimbriefUnavailableError,
    );
  });

  it('refuses to read a plan when Simbrief fails', async () => {
    const client = answerWith(() => Promise.resolve(jsonResponse({}, 503)));

    await expect(client.findOperationalFlightPlan('987654')).rejects.toThrow(
      SimbriefUnavailableError,
    );
  });

  it('refuses to read a plan when Simbrief cannot be reached', async () => {
    const client = answerWith(() => Promise.reject(new Error('ECONNREFUSED')));

    await expect(client.findOperationalFlightPlan('987654')).rejects.toThrow(
      SimbriefUnavailableError,
    );
  });

  it('reports a missing account when a plan is demanded for an unknown user ID', async () => {
    const client = answerWith(() =>
      Promise.resolve(jsonResponse(UNKNOWN_USER_BODY, 400)),
    );

    await expect(client.getOperationalFlightPlan('999999999')).rejects.toThrow(
      SimbriefUserNotFoundError,
    );
  });
});
