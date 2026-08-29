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

describe('SimbriefClient route map data', () => {
  const originalFetch = global.fetch;
  const client = new SimbriefClient('http://simbrief.test');
  const url = 'http://simbrief.test/ofp/flightplans/PLAN_MJS_1.js';

  const MAP_BODY = [
    '//SimBrief route definition',
    'var natsdir = "E";',
    'var etopsdata = true;',
    'var etopsrule = 370;',
    'var etopsruledist = 2694.8333333333;',
    'var etopsthreshold = 60;',
  ].join('\n');

  function textResponse(body: string, status: number): Response {
    return new Response(body, {
      status,
      headers: { 'Content-Type': 'application/javascript' },
    });
  }

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('reads the ETOPS figures the companion file publishes', async () => {
    global.fetch = jest.fn().mockResolvedValue(textResponse(MAP_BODY, 200));

    await expect(client.findRouteMapData(url)).resolves.toEqual({
      etopsRule: 370,
      etopsRuleDistance: 2694.8333333333,
      etopsThresholdMinutes: 60,
      tracksDirection: 'E',
    });
  });

  it('reports nothing when the companion file is unreachable', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('network down'));

    await expect(client.findRouteMapData(url)).resolves.toBeNull();
  });

  it('reports nothing when the companion file is missing', async () => {
    global.fetch = jest.fn().mockResolvedValue(textResponse('', 404));

    await expect(client.findRouteMapData(url)).resolves.toBeNull();
  });

  it('reports nothing when the companion file carries no ETOPS figures', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(textResponse('var routing = [];', 200));

    await expect(client.findRouteMapData(url)).resolves.toBeNull();
  });

  it('reports the figures it can read when the file is partial', async () => {
    global.fetch = jest
      .fn()
      .mockResolvedValue(textResponse('var etopsruledist = 1800;', 200));

    await expect(client.findRouteMapData(url)).resolves.toEqual({
      etopsRule: undefined,
      etopsRuleDistance: 1800,
      etopsThresholdMinutes: undefined,
      tracksDirection: undefined,
    });
  });
});
