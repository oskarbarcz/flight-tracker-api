import { mapPlannedRoute } from './planned-route.mapper';
import {
  NavlogFix,
  OperationalFlightPlan,
} from '../../../core/provider/simbrief/type/simbrief.types';

function fix(overrides: Partial<NavlogFix> & { ident: string }): NavlogFix {
  return {
    pos_lat: '50.000000',
    pos_long: '8.000000',
    altitude_feet: '35000',
    time_total: '600',
    distance: '120',
    track_true: '270',
    track_mag: '275',
    via_airway: 'DCT',
    stage: 'CRZ',
    ...overrides,
  };
}

function plan(
  fixes: NavlogFix[],
  origin: Partial<OperationalFlightPlan['origin']> = {},
): OperationalFlightPlan {
  return {
    origin: { icao_code: 'EDDF', ...origin },
    navlog: { fix: fixes },
  } as OperationalFlightPlan;
}

describe('mapPlannedRoute', () => {
  it('keeps the published order and numbers it from zero', () => {
    const route = mapPlannedRoute(
      plan([
        fix({ ident: 'EDDF' }),
        fix({ ident: 'TOBAK' }),
        fix({ ident: 'KJFK' }),
      ]),
    );

    expect(route.map((entry) => entry.ident)).toEqual([
      'EDDF',
      'TOBAK',
      'KJFK',
    ]);
    expect(route.map((entry) => entry.ordinal)).toEqual([0, 1, 2]);
  });

  it('gives every fix a position', () => {
    const route = mapPlannedRoute(
      plan([fix({ ident: 'EDDF' }), fix({ ident: 'TOBAK' })]),
    );

    expect(
      route.every(
        (entry) =>
          Number.isFinite(entry.latitude) && Number.isFinite(entry.longitude),
      ),
    ).toBe(true);
  });

  it('maps the figures the plan publishes per fix', () => {
    const [, entry] = mapPlannedRoute(
      plan([
        fix({ ident: 'EDDF' }),
        fix({
          ident: 'TOBAK',
          pos_lat: '51.250000',
          pos_long: '7.500000',
          altitude_feet: '39000',
          time_total: '1320',
          distance: '86',
          track_true: '284',
          track_mag: '291',
          via_airway: 'UZ100',
          stage: 'CRZ',
        }),
      ]),
    );

    expect(entry).toEqual({
      ordinal: 1,
      ident: 'TOBAK',
      latitude: 51.25,
      longitude: 7.5,
      altitude: 39000,
      elapsedSeconds: 1320,
      distanceNm: 86,
      trackTrue: 284,
      trackMag: 291,
      viaAirway: 'UZ100',
      stage: 'CRZ',
    });
  });

  it('keeps the top of climb and top of descent pseudo-fixes', () => {
    const route = mapPlannedRoute(
      plan([
        fix({ ident: 'EDDF' }),
        fix({ ident: 'TOC' }),
        fix({ ident: 'TOD' }),
        fix({ ident: 'KJFK' }),
      ]),
    );

    expect(route.map((entry) => entry.ident)).toContain('TOC');
    expect(route.map((entry) => entry.ident)).toContain('TOD');
  });

  it('writes the departure airport as the first fix when the plan omits it', () => {
    const route = mapPlannedRoute(
      plan([fix({ ident: 'MERIT' }), fix({ ident: 'KJFK' })], {
        icao_code: 'EDDF',
        pos_lat: '50.033306',
        pos_long: '8.570456',
        elevation: '364',
      }),
    );

    expect(route[0]).toEqual({
      ordinal: 0,
      ident: 'EDDF',
      latitude: 50.033306,
      longitude: 8.570456,
      altitude: 364,
      elapsedSeconds: 0,
      distanceNm: 0,
      trackTrue: null,
      trackMag: null,
      viaAirway: null,
      stage: 'CLB',
    });
    expect(route.map((entry) => entry.ident)).toEqual([
      'EDDF',
      'MERIT',
      'KJFK',
    ]);
  });

  it('does not add a second departure fix when the plan already opens with one', () => {
    const route = mapPlannedRoute(
      plan([fix({ ident: 'EDDF', time_total: '0' }), fix({ ident: 'KJFK' })], {
        icao_code: 'EDDF',
        pos_lat: '50.033306',
        pos_long: '8.570456',
      }),
    );

    expect(route.filter((entry) => entry.ident === 'EDDF')).toHaveLength(1);
    expect(route[0].elapsedSeconds).toBe(0);
  });

  it('leaves the route as published when the origin has no position to add', () => {
    const route = mapPlannedRoute(
      plan([fix({ ident: 'MERIT' }), fix({ ident: 'KJFK' })]),
    );

    expect(route.map((entry) => entry.ident)).toEqual(['MERIT', 'KJFK']);
  });

  it('starts at zero elapsed time and ends at the destination', () => {
    const route = mapPlannedRoute(
      plan([
        fix({ ident: 'EDDF', time_total: '0' }),
        fix({ ident: 'TOBAK', time_total: '900' }),
        fix({ ident: 'KJFK', time_total: '19800' }),
      ]),
    );

    expect(route[0].elapsedSeconds).toBe(0);
    expect(route[route.length - 1].ident).toBe('KJFK');
    expect(route[route.length - 1].elapsedSeconds).toBe(19800);
  });

  it('drops a fix the plan gives no position for', () => {
    const route = mapPlannedRoute(
      plan([
        fix({ ident: 'EDDF' }),
        fix({ ident: 'NOWHERE', pos_lat: undefined, pos_long: undefined }),
        fix({ ident: 'KJFK' }),
      ]),
    );

    expect(route.map((entry) => entry.ident)).toEqual(['EDDF', 'KJFK']);
    expect(route.map((entry) => entry.ordinal)).toEqual([0, 1]);
  });

  it('accepts a plan that publishes a single fix rather than a list', () => {
    const route = mapPlannedRoute({
      origin: { icao_code: 'EDDF' },
      navlog: { fix: fix({ ident: 'EDDF' }) },
    } as OperationalFlightPlan);

    expect(route).toHaveLength(1);
    expect(route[0].ident).toBe('EDDF');
  });

  it('reports no route for a plan carrying no navlog', () => {
    expect(
      mapPlannedRoute({
        origin: { icao_code: 'EDDF' },
      } as OperationalFlightPlan),
    ).toEqual([]);
  });

  it('reads the figures the plan omits as absent rather than zero', () => {
    const [entry] = mapPlannedRoute(
      plan([
        fix({
          ident: 'EDDF',
          distance: undefined,
          track_true: undefined,
          track_mag: undefined,
          via_airway: undefined,
        }),
      ]),
    );

    expect(entry.distanceNm).toBeNull();
    expect(entry.trackTrue).toBeNull();
    expect(entry.trackMag).toBeNull();
    expect(entry.viaAirway).toBeNull();
  });
});
