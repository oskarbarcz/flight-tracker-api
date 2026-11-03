import { OceanicTracksClient } from './oceanic-tracks.client';
import { OceanicTracksSet } from '../type/oceanic-tracks.types';
import { OceanicTracksUnavailableError } from '../error/oceanic-tracks.error';

const BASE_URL = 'https://faas.example/oceanic-tracks-provider/oceanic-tracks';

const SECRET = 'shared-secret';

const trackSet: OceanicTracksSet = {
  fetchedAt: '2026-11-03T22:02:47.722Z',
  tracks: [
    {
      system: 'pacots',
      identifier: 'A',
      direction: 'west',
      issuingAuthority: 'KZAK',
      notamNumber: 'A5313/26',
      validFrom: '2026-11-03T19:00:00.000Z',
      validTo: '2026-11-04T08:00:00.000Z',
      route: 'PUPPI 23N170W',
      levels: [],
      fixes: [{ ident: 'PUPPI', latitude: 21.921383, longitude: -161.679633 }],
      unresolvedFixes: [],
      remarks: null,
      message: '(TDM TRK A 261103190001 2611031900 2611040800 PUPPI 23N170W)',
    },
  ],
  unreadableMessages: [],
};

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  } as Response;
}

describe('OceanicTracksClient', () => {
  let fetchMock: jest.SpyInstance;

  const client = new OceanicTracksClient(BASE_URL, SECRET);

  afterEach(() => {
    fetchMock?.mockRestore();
  });

  it('asks the function for the tracks with the shared secret', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(200, trackSet));

    expect(await client.listTracks()).toEqual(trackSet);

    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/tracks`);
    expect(init.headers['X-Require-Whisk-Auth']).toBe(SECRET);
  });

  it.each(['NMS_UNAVAILABLE', 'FIX_DIRECTORY_UNAVAILABLE'])(
    'translates %s into unavailable tracks',
    async (code) => {
      fetchMock = jest
        .spyOn(global, 'fetch')
        .mockResolvedValue(jsonResponse(502, { error: { code } }));

      await expect(client.listTracks()).rejects.toBeInstanceOf(
        OceanicTracksUnavailableError,
      );
    },
  );

  it('translates a rejected secret into unavailable tracks', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockResolvedValue(jsonResponse(401, 'Unauthorized'));

    await expect(client.listTracks()).rejects.toBeInstanceOf(
      OceanicTracksUnavailableError,
    );
  });

  it('translates an unreachable function into unavailable tracks', async () => {
    fetchMock = jest
      .spyOn(global, 'fetch')
      .mockRejectedValue(new TypeError('fetch failed'));

    await expect(client.listTracks()).rejects.toBeInstanceOf(
      OceanicTracksUnavailableError,
    );
  });
});
