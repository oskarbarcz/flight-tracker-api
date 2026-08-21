import { OsmClient } from './osm.client';
import { OsmAirportData } from '../type/osm.types';
import {
  AerodromeNotFoundError,
  AirportDataTooLargeError,
  OsmProviderUnavailableError,
} from '../error/osm.error';

const BASE_URL = 'https://faas.example/osm-provider/airport';

const PULL_URL = `${BASE_URL}/pull`;

const SECRET = 'shared-secret';

const airport = {
  icaoCode: 'EDDW',
  name: 'Bremen',
  source: 'OpenStreetMap via Overpass',
  runways: [{ designator: '09' }],
  terminals: [],
  parkingPositions: [],
  gates: [],
} as unknown as OsmAirportData;

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('OsmClient', () => {
  let fetchMock: jest.SpyInstance;

  const client = new OsmClient(BASE_URL, SECRET);

  afterEach(() => {
    fetchMock?.mockRestore();
  });

  it('asks the function for an airport and unwraps it', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, { airport }));

    expect(await client.pullAirport('EDDW')).toEqual(airport);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${PULL_URL}?icao=EDDW`);
    expect(init.headers['X-Require-Whisk-Auth']).toBe(SECRET);
  });

  it('upper cases the ICAO code', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, { airport }));

    await client.pullAirport('eddw');

    expect(fetchMock.mock.calls[0][0]).toBe(`${PULL_URL}?icao=EDDW`);
  });

  it('narrows the pull to the sections asked for', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, { airport }));

    await client.pullAirport('EDDW', ['runways', 'terminals']);

    expect(fetchMock.mock.calls[0][0]).toBe(
      `${PULL_URL}?icao=EDDW&include=runways%2Cterminals`,
    );
  });

  it('asks for every section when none is named', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, { airport }));

    await client.pullAirport('EDDW', []);

    expect(fetchMock.mock.calls[0][0]).not.toContain('include');
  });

  it('translates a 404 into a missing aerodrome, naming the code asked for', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        jsonResponse(404, { error: { code: 'AERODROME_NOT_FOUND' } }),
      );

    await expect(client.pullAirport('ZZZZ')).rejects.toBeInstanceOf(
      AerodromeNotFoundError,
    );
    await expect(client.pullAirport('ZZZZ')).rejects.toThrow('ZZZZ');
  });

  it('translates an oversized airport into its own failure', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        jsonResponse(413, { error: { code: 'RESULT_TOO_LARGE' } }),
      );

    await expect(client.pullAirport('EDDF')).rejects.toBeInstanceOf(
      AirportDataTooLargeError,
    );
  });

  it('treats an Overpass outage as an upstream outage', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        jsonResponse(502, { error: { code: 'OVERPASS_UNAVAILABLE' } }),
      );

    await expect(client.pullAirport('EDDW')).rejects.toBeInstanceOf(
      OsmProviderUnavailableError,
    );
  });

  it('treats a rejected secret as an upstream outage', async () => {
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      jsonResponse(401, {
        error:
          'Authentication is possible but has failed or not yet been provided.',
      }),
    );

    await expect(client.pullAirport('EDDW')).rejects.toBeInstanceOf(
      OsmProviderUnavailableError,
    );
  });

  it('treats an unreachable function as an upstream outage', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(client.pullAirport('EDDW')).rejects.toBeInstanceOf(
      OsmProviderUnavailableError,
    );
  });
});
