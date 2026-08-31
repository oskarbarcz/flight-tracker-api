import {
  resolveOceanicRouting,
  resolveTrackDirection,
} from './oceanic-routing';
import { mapOceanicTracks } from './oceanic-track.mapper';
import { OceanicRouting, TrackDirection } from './oceanic.model';
import {
  NavlogFix,
  OperationalFlightPlan,
} from '../../../core/provider/simbrief/type/simbrief.types';

function fix(ident: string, viaAirway?: string): NavlogFix {
  return {
    ident,
    pos_lat: '55.000000',
    pos_long: '-30.000000',
    via_airway: viaAirway,
  };
}

function plan(fixes: NavlogFix[], atcRoute?: string): OperationalFlightPlan {
  return {
    navlog: { fix: fixes },
    atc: atcRoute === undefined ? {} : { route: atcRoute },
  } as OperationalFlightPlan;
}

describe('resolveOceanicRouting', () => {
  it('reports a flight planned along a track and filing it as on that track', () => {
    const routing = resolveOceanicRouting(
      plan(
        [fix('MALOT'), fix('5620N', 'NATA'), fix('JANJO', 'NATA')],
        'DIGBY UN546 LAPEX NATA JANJO DCT HOIST',
      ),
      null,
    );

    expect(routing.routing).toBe(OceanicRouting.Track);
    expect(routing.trackId).toBe('A');
  });

  it('reports a flight planned along track geometry but filing the fixes individually', () => {
    const routing = resolveOceanicRouting(
      plan(
        [fix('ALLRY', 'NATW'), fix('51N050W', 'NATW')],
        'ALLEX N503B ALLRY/M085F400 DCT 51N050W 52N040W DCT MALOT',
      ),
      null,
    );

    expect(routing.routing).toBe(OceanicRouting.TrackGeometry);
    expect(routing.trackId).toBe('W');
  });

  it('reports a flight touching no track as random', () => {
    const routing = resolveOceanicRouting(
      plan([fix('SPI', 'UZ29'), fix('LAMSO', 'UL607')], 'SPI UZ29 LAMSO'),
      null,
    );

    expect(routing.routing).toBe(OceanicRouting.Random);
    expect(routing.trackId).toBeNull();
  });

  it('does not mistake a route string mentioning the track for a filed track', () => {
    const routing = resolveOceanicRouting(
      plan([fix('ALLRY', 'NATW')], 'ALLRY DCT 51N050W NATWEST'),
      null,
    );

    expect(routing.routing).toBe(OceanicRouting.TrackGeometry);
  });

  it('reports random for a plan carrying no navlog at all', () => {
    expect(
      resolveOceanicRouting({} as OperationalFlightPlan, null).routing,
    ).toBe(OceanicRouting.Random);
  });

  it('takes the direction from the companion file rather than the geography', () => {
    const routing = resolveOceanicRouting(
      plan([fix('5620N', 'NATA')], 'NATA'),
      { tracksDirection: 'E' },
    );

    expect(routing.direction).toBe(TrackDirection.East);
  });

  it('reports no direction where the companion file is unavailable', () => {
    expect(resolveTrackDirection(null)).toBeNull();
    expect(resolveTrackDirection({})).toBeNull();
    expect(resolveTrackDirection({ tracksDirection: 'X' })).toBeNull();
  });

  it('reads both directions the companion file can state', () => {
    expect(resolveTrackDirection({ tracksDirection: 'W' })).toBe(
      TrackDirection.West,
    );
    expect(resolveTrackDirection({ tracksDirection: 'e' })).toBe(
      TrackDirection.East,
    );
  });
});

describe('mapOceanicTracks', () => {
  function trackPlan(nat: unknown): OperationalFlightPlan {
    return { tracks: { nat } } as OperationalFlightPlan;
  }

  it('maps a published track whole', () => {
    const [track] = mapOceanicTracks(
      trackPlan([
        {
          id: 'A',
          group: 'West',
          tmi: '241',
          addr: 'EGGX',
          route: 'MALOT 5620N JANJO',
          levels: '340 350 360',
          start: '1736074800',
          end: '1736101800',
          fixes: {
            fix: [
              { ident: 'MALOT', pos_lat: '54.000000', pos_long: '-15.000000' },
              { ident: 'JANJO', pos_lat: '55.500000', pos_long: '-53.000000' },
            ],
          },
        },
      ]),
    );

    expect(track).toEqual({
      identifier: 'A',
      direction: TrackDirection.West,
      tmi: '241',
      issuingOca: 'EGGX',
      route: 'MALOT 5620N JANJO',
      levels: [340, 350, 360],
      validFrom: new Date(1736074800 * 1000),
      validTo: new Date(1736101800 * 1000),
      fixes: [
        { ident: 'MALOT', latitude: 54, longitude: -15 },
        { ident: 'JANJO', latitude: 55.5, longitude: -53 },
      ],
    });
  });

  it('keeps both directions as published', () => {
    const tracks = mapOceanicTracks(
      trackPlan([
        { id: 'A', group: 'West', tmi: '241' },
        { id: 'X', group: 'East', tmi: '241' },
      ]),
    );

    expect(tracks.map((track) => track.direction)).toEqual([
      TrackDirection.West,
      TrackDirection.East,
    ]);
  });

  it('accepts a message publishing a single track rather than a list', () => {
    const tracks = mapOceanicTracks(
      trackPlan({ id: 'A', group: 'West', tmi: '241' }),
    );

    expect(tracks).toHaveLength(1);
  });

  it('drops a track that names no direction or no TMI', () => {
    const tracks = mapOceanicTracks(
      trackPlan([
        { id: 'A', group: 'West', tmi: '241' },
        { id: 'B', group: {}, tmi: '241' },
        { id: 'C', group: 'West' },
      ]),
    );

    expect(tracks.map((track) => track.identifier)).toEqual(['A']);
  });

  it('drops a track fix the message gives no position for', () => {
    const [track] = mapOceanicTracks(
      trackPlan([
        {
          id: 'A',
          group: 'West',
          tmi: '241',
          fixes: {
            fix: [
              { ident: 'MALOT', pos_lat: '54.000000', pos_long: '-15.000000' },
              { ident: 'NOWHERE' },
            ],
          },
        },
      ]),
    );

    expect(track.fixes.map((entry) => entry.ident)).toEqual(['MALOT']);
  });

  it('reports no tracks for a plan publishing none', () => {
    expect(mapOceanicTracks({} as OperationalFlightPlan)).toEqual([]);
  });
});
