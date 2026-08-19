import { AerolopaClient } from './aerolopa.client';
import { AerolopaSeatMap } from '../type/aerolopa.types';
import {
  AerolopaUnavailableError,
  SeatMapNotFoundError,
  SeatMapUnreadableError,
} from '../error/aerolopa.error';

const FUNCTION_URL = 'https://faas.example/aerolopa-provider/aerolopa/seatmap';

const SECRET = 'shared-secret';

const seatMap = {
  slug: 'lh-32n',
  seats: [{ designator: '01A' }],
} as unknown as AerolopaSeatMap;

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('AerolopaClient', () => {
  let fetchMock: jest.SpyInstance;

  const client = new AerolopaClient(FUNCTION_URL, SECRET);

  afterEach(() => {
    fetchMock?.mockRestore();
  });

  it('asks the function for a seat map and unwraps it', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, { seatMap }));

    expect(await client.getSeatMap('lh-32n')).toEqual(seatMap);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${FUNCTION_URL}?op=seatmap&slug=lh-32n`);
    expect(init.headers['X-Require-Whisk-Auth']).toBe(SECRET);
  });

  it('upper cases the codes when resolving', async () => {
    const resolution = {
      airlineIata: 'LO',
      aircraftIata: '7M8',
      candidateCount: 3,
      ambiguous: true,
      candidates: ['lo-7m8-1', 'lo-7m8-2', 'lo-7m8-3'],
      seatMaps: [],
    };
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, resolution));

    expect(await client.resolve('lo', '7m8')).toEqual(resolution);
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${FUNCTION_URL}?op=resolve&airline=LO&aircraft=7M8&includeSeatMaps=false`,
    );
  });

  it('asks for the seat maps only when told to', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, { candidates: [], seatMaps: [] }));

    await client.resolve('LH', '32N', true);

    expect(fetchMock.mock.calls[0][0]).toContain('includeSeatMaps=true');
  });

  it('lists every known configuration', async () => {
    const index = {
      count: 2,
      configurations: [
        { slug: 'lh-32n', airlineIata: 'LH', aircraftIata: '32N' },
        { slug: 'lo-7m8-1', airlineIata: 'LO', aircraftIata: '7M8' },
      ],
    };
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, index));

    expect(await client.listConfigurations()).toEqual(index);
    expect(fetchMock.mock.calls[0][0]).toBe(
      `${FUNCTION_URL}?op=configurations`,
    );
  });

  it('translates a 404 into a missing seat map', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        jsonResponse(404, { error: { code: 'SEAT_MAP_NOT_FOUND' } }),
      );

    await expect(client.getSeatMap('zz-999')).rejects.toBeInstanceOf(
      SeatMapNotFoundError,
    );
  });

  it('translates an unparsable payload into an unreadable seat map', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        jsonResponse(502, { error: { code: 'SEAT_MAP_UNREADABLE' } }),
      );

    await expect(client.getSeatMap('lh-32n')).rejects.toBeInstanceOf(
      SeatMapUnreadableError,
    );
  });

  it('keeps a seat map failure off the resolve path', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        jsonResponse(404, { error: { code: 'SEAT_MAP_NOT_FOUND' } }),
      );

    await expect(client.resolve('ZZ', '999')).rejects.toBeInstanceOf(
      AerolopaUnavailableError,
    );
  });

  it('treats a function failure as an upstream outage', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(
        jsonResponse(502, { error: { code: 'AEROLOPA_UNAVAILABLE' } }),
      );

    await expect(client.getSeatMap('lh-32n')).rejects.toBeInstanceOf(
      AerolopaUnavailableError,
    );
  });

  it('treats a rejected secret as an upstream outage', async () => {
    fetchMock = jest.spyOn(global, 'fetch').mockResolvedValue(
      jsonResponse(401, {
        error:
          'Authentication is possible but has failed or not yet been provided.',
      }),
    );

    await expect(client.getSeatMap('lh-32n')).rejects.toBeInstanceOf(
      AerolopaUnavailableError,
    );
  });

  it('treats an unreachable function as an upstream outage', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new Error('ECONNREFUSED'));

    await expect(client.getSeatMap('lh-32n')).rejects.toBeInstanceOf(
      AerolopaUnavailableError,
    );
  });
});
