import type { Cache } from 'cache-manager';
import { CACHE_KEYS, CACHE_TTL_MS } from '../../../../core/cache/cache.key';
import { OceanicTracksClient } from '../../../../core/provider/oceanic-tracks/client/oceanic-tracks.client';
import { OceanicTracksUnavailableError } from '../../../../core/provider/oceanic-tracks/error/oceanic-tracks.error';
import { OceanicTracksSet } from '../../../../core/provider/oceanic-tracks/type/oceanic-tracks.types';
import { TrackDirection } from '../../../flights/model/oceanic.model';
import { OceanicTrackSystem } from '../../model/oceanic-track.model';
import { GetCurrentOceanicTracksHandler } from './get-current-oceanic-tracks.query';

const trackSet: OceanicTracksSet = {
  fetchedAt: '2026-11-03T22:02:47.722Z',
  tracks: [
    {
      system: 'pacots',
      identifier: '11',
      direction: 'east',
      issuingAuthority: 'RJJJ',
      notamNumber: 'Q2635/26',
      validFrom: '2026-11-04T10:00:00.000Z',
      validTo: '2026-11-04T21:00:00.000Z',
      route: 'LEPKI 38N160E THOMA',
      levels: [],
      fixes: [{ ident: '38N160E', latitude: 38, longitude: 160 }],
      unresolvedFixes: ['LEPKI', 'THOMA'],
      remarks: 'TRK 12 NOT AVAILABLE',
      message: 'TRACK 11.',
    },
  ],
  unreadableMessages: [],
};

function fakeCache(initial?: OceanicTracksSet) {
  const store = new Map<string, unknown>(
    initial ? [[CACHE_KEYS.OCEANIC_TRACKS, initial]] : [],
  );

  return {
    get: jest.fn((key: string) => Promise.resolve(store.get(key))),
    set: jest.fn((key: string, value: unknown) => {
      store.set(key, value);
      return Promise.resolve(value);
    }),
  };
}

function fakeClient(listTracks: jest.Mock) {
  return { listTracks } as unknown as OceanicTracksClient;
}

describe('GetCurrentOceanicTracksHandler', () => {
  it('reads the tracks once, keeps them for 15 minutes and maps them', async () => {
    const cache = fakeCache();
    const listTracks = jest.fn().mockResolvedValue(trackSet);
    const handler = new GetCurrentOceanicTracksHandler(
      fakeClient(listTracks),
      cache as unknown as Cache,
    );

    const tracks = await handler.execute();

    expect(cache.set).toHaveBeenCalledWith(
      CACHE_KEYS.OCEANIC_TRACKS,
      trackSet,
      CACHE_TTL_MS.OCEANIC_TRACKS,
    );
    expect(tracks).toEqual({
      fetchedAt: new Date('2026-11-03T22:02:47.722Z'),
      tracks: [
        {
          system: OceanicTrackSystem.Pacots,
          identifier: '11',
          direction: TrackDirection.East,
          issuingAuthority: 'RJJJ',
          notamNumber: 'Q2635/26',
          validFrom: new Date('2026-11-04T10:00:00.000Z'),
          validTo: new Date('2026-11-04T21:00:00.000Z'),
          route: 'LEPKI 38N160E THOMA',
          levels: [],
          fixes: [{ ident: '38N160E', latitude: 38, longitude: 160 }],
          unresolvedFixes: ['LEPKI', 'THOMA'],
          remarks: 'TRK 12 NOT AVAILABLE',
          message: 'TRACK 11.',
        },
      ],
    });
  });

  it('serves the kept tracks without asking the function again', async () => {
    const listTracks = jest.fn();
    const handler = new GetCurrentOceanicTracksHandler(
      fakeClient(listTracks),
      fakeCache(trackSet) as unknown as Cache,
    );

    const tracks = await handler.execute();

    expect(listTracks).not.toHaveBeenCalled();
    expect(tracks.tracks.map((track) => track.identifier)).toEqual(['11']);
  });

  it('keeps nothing when the function fails', async () => {
    const cache = fakeCache();
    const handler = new GetCurrentOceanicTracksHandler(
      fakeClient(
        jest.fn().mockRejectedValue(new OceanicTracksUnavailableError()),
      ),
      cache as unknown as Cache,
    );

    await expect(handler.execute()).rejects.toBeInstanceOf(
      OceanicTracksUnavailableError,
    );
    expect(cache.set).not.toHaveBeenCalled();
  });
});
