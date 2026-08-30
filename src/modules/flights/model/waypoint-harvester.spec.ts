import { OperationalFlightPlan } from '../../../core/provider/simbrief/type/simbrief.types';
import { harvestWaypoints, isCoordinateNamed } from './waypoint-harvester';
import { WaypointKind } from '../../waypoints/model/waypoint.model';

function planWith(
  parts: Partial<OperationalFlightPlan>,
): OperationalFlightPlan {
  return parts as OperationalFlightPlan;
}

const routePlan = planWith({
  navlog: {
    fix: [
      {
        ident: 'AMVUL',
        type: 'wpt',
        icao_region: 'SB',
        pos_lat: '-23.399589',
        pos_long: '-46.362233',
      },
      {
        ident: 'CGO',
        type: 'vor',
        icao_region: 'SB',
        frequency: '116.90',
        pos_lat: '-23.627464',
        pos_long: '-46.654636',
      },
      {
        ident: 'TOC',
        type: 'ltlg',
        pos_lat: '-24.169537',
        pos_long: '-47.085553',
      },
      {
        ident: 'TOD',
        type: 'ltlg',
        pos_lat: '-33.780754',
        pos_long: '-57.254437',
      },
      {
        ident: 'SBGR',
        type: 'apt',
        icao_region: 'SB',
        pos_lat: '-23.435556',
        pos_long: '-46.473056',
      },
    ],
  },
});

describe('waypoint harvesting', () => {
  it('keeps published waypoints with their region', () => {
    const harvested = harvestWaypoints(routePlan);
    const amvul = harvested.find((w) => w.ident === 'AMVUL');

    expect(amvul).toEqual({
      ident: 'AMVUL',
      icaoRegion: 'SB',
      kind: WaypointKind.Waypoint,
      latitude: -23.399589,
      longitude: -46.362233,
      frequency: null,
    });
  });

  it('keeps a navaid with its frequency', () => {
    const harvested = harvestWaypoints(routePlan);
    const cgo = harvested.find((w) => w.ident === 'CGO');

    expect(cgo?.kind).toBe(WaypointKind.Navaid);
    expect(cgo?.frequency).toBe(116.9);
  });

  it('skips the top of climb and the top of descent', () => {
    const idents = harvestWaypoints(routePlan).map((w) => w.ident);

    expect(idents).not.toContain('TOC');
    expect(idents).not.toContain('TOD');
  });

  it('skips airports on the route', () => {
    const idents = harvestWaypoints(routePlan).map((w) => w.ident);

    expect(idents).not.toContain('SBGR');
  });

  it('harvests the routes to the alternates too', () => {
    const harvested = harvestWaypoints(
      planWith({
        alternate_navlog: [
          {
            icao_code: 'SBSP',
            fix: [
              {
                ident: 'DOKVA',
                type: 'wpt',
                icao_region: 'SB',
                pos_lat: '-23.1',
                pos_long: '-46.2',
              },
            ],
          },
        ],
      }),
    );

    expect(harvested.map((w) => w.ident)).toEqual(['DOKVA']);
  });

  it('harvests named oceanic track fixes without a region', () => {
    const harvested = harvestWaypoints(
      planWith({
        tracks: {
          nat: [
            {
              id: 'W',
              fixes: {
                fix: [
                  { ident: 'ALLRY', pos_lat: '50.5', pos_long: '-52' },
                  { ident: '5150N', pos_lat: '51', pos_long: '-50' },
                  { ident: 'MALOT', pos_lat: '53', pos_long: '-15' },
                ],
              },
            },
          ],
        },
      }),
    );

    expect(harvested.map((w) => w.ident).sort()).toEqual(['ALLRY', 'MALOT']);
    expect(harvested.every((w) => w.icaoRegion === null)).toBe(true);
  });

  it('skips track fixes named after their own coordinates', () => {
    const harvested = harvestWaypoints(
      planWith({
        tracks: {
          nat: {
            id: 'W',
            fixes: {
              fix: [
                { ident: '5240N', pos_lat: '52', pos_long: '-40' },
                { ident: '6130N03000W', pos_lat: '61.5', pos_long: '-30' },
              ],
            },
          },
        },
      }),
    );

    expect(harvested).toEqual([]);
  });

  it('skips a fix the plan publishes without coordinates', () => {
    const harvested = harvestWaypoints(
      planWith({
        navlog: { fix: { ident: 'NOPOS', type: 'wpt', icao_region: 'SB' } },
      }),
    );

    expect(harvested).toEqual([]);
  });

  it('harvests nothing from a plan carrying no route', () => {
    expect(harvestWaypoints(planWith({}))).toEqual([]);
  });

  it('reports one entry when the same waypoint appears twice in a plan', () => {
    const fix = {
      ident: 'AMVUL',
      type: 'wpt',
      icao_region: 'SB',
      pos_lat: '-23.399589',
      pos_long: '-46.362233',
    };
    const harvested = harvestWaypoints(
      planWith({ navlog: { fix: [fix, fix] } }),
    );

    expect(harvested).toHaveLength(1);
  });

  it('keeps the same identifier in two regions apart', () => {
    const harvested = harvestWaypoints(
      planWith({
        navlog: {
          fix: [
            {
              ident: 'ALFA',
              type: 'wpt',
              icao_region: 'SB',
              pos_lat: '-23.1',
              pos_long: '-46.2',
            },
            {
              ident: 'ALFA',
              type: 'wpt',
              icao_region: 'SU',
              pos_lat: '-33.1',
              pos_long: '-56.2',
            },
          ],
        },
      }),
    );

    expect(harvested).toHaveLength(2);
    expect(harvested.map((w) => w.icaoRegion).sort()).toEqual(['SB', 'SU']);
  });
});

describe('coordinate-named identifiers', () => {
  it.each(['5150N', '5240N', '51N050W', '6130N03000W'])(
    'treats %s as named after its own coordinates',
    (ident) => {
      expect(isCoordinateNamed(ident)).toBe(true);
    },
  );

  it.each(['ALLRY', 'MALOT', 'GISTI', 'SUNOT', 'JANJO', 'CGO'])(
    'treats %s as a published waypoint',
    (ident) => {
      expect(isCoordinateNamed(ident)).toBe(false);
    },
  );
});

describe('a waypoint arriving both on the route and in the track structure', () => {
  const plan = {
    navlog: {
      fix: [
        {
          ident: 'MALOT',
          type: 'wpt',
          icao_region: 'EI',
          pos_lat: '54.000000',
          pos_long: '-15.000000',
        },
      ],
    },
    tracks: {
      nat: {
        id: 'A',
        fixes: {
          fix: [
            { ident: 'MALOT', pos_lat: '54.000000', pos_long: '-15.000000' },
          ],
        },
      },
    },
  } as unknown as OperationalFlightPlan;

  it('is catalogued once, keeping the region the route gave it', () => {
    const harvested = harvestWaypoints(plan);

    expect(harvested).toHaveLength(1);
    expect(harvested[0].icaoRegion).toBe('EI');
  });

  it('keeps a track fix that appears nowhere on the route', () => {
    const harvested = harvestWaypoints({
      ...plan,
      tracks: {
        nat: {
          id: 'A',
          fixes: {
            fix: [
              { ident: 'NEEKO', pos_lat: '54.000000', pos_long: '-50.000000' },
            ],
          },
        },
      },
    } as unknown as OperationalFlightPlan);

    expect(harvested.map((w) => w.ident).sort()).toEqual(['MALOT', 'NEEKO']);
  });
});
