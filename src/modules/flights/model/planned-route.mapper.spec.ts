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
  units = 'kgs',
): OperationalFlightPlan {
  return {
    params: { units },
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
          fuel_flow: '7719',
          fuel_leg: '4022',
          fuel_totalused: '47458',
          fuel_min_onboard: '45611',
          fuel_plan_onboard: '48194',
          oat: '-43',
          oat_isa_dev: '12',
          wind_dir: '108',
          wind_spd: '20',
          tropopause_feet: '54300',
          mora: '2000',
          fir: 'GOOO',
          wind_data: {
            level: [
              { altitude: '0', wind_dir: '27', wind_spd: '10', oat: '25' },
              {
                altitude: '30000',
                wind_dir: '92',
                wind_spd: '26',
                oat: '-37',
              },
            ],
          },
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
      fuel: {
        flow: 7719,
        leg: 4022,
        used: 47458,
        minimumOnBoard: 45611,
        plannedOnBoard: 48194,
      },
      oat: -43,
      isaDeviation: 12,
      tropopause: 54300,
      mora: 2000,
      fir: 'GOOO',
      wind: {
        direction: 108,
        speed: 20,
        levels: [
          { altitude: 0, direction: 27, speed: 10, oat: 25 },
          { altitude: 30000, direction: 92, speed: 26, oat: -37 },
        ],
      },
    });
  });

  it('reads a wind speed the plan pads with a leading zero', () => {
    const [entry] = mapPlannedRoute(
      plan([fix({ ident: 'EDDF', wind_spd: '09' })]),
    );

    expect(entry.wind.speed).toBe(9);
  });

  it('accepts a fix publishing a single wind level rather than a list', () => {
    const [entry] = mapPlannedRoute(
      plan([
        fix({
          ident: 'EDDF',
          wind_data: {
            level: { altitude: '0', wind_dir: '27', wind_spd: '10', oat: '25' },
          },
        }),
      ]),
    );

    expect(entry.wind.levels).toEqual([
      { altitude: 0, direction: 27, speed: 10, oat: 25 },
    ]);
  });

  it('drops a wind level the plan leaves incomplete', () => {
    const [entry] = mapPlannedRoute(
      plan([
        fix({
          ident: 'EDDF',
          wind_data: {
            level: [
              { altitude: '0', wind_dir: '27', wind_spd: '10', oat: '25' },
              { altitude: '30000', wind_dir: '92', wind_spd: '26' },
            ],
          },
        }),
      ]),
    );

    expect(entry.wind.levels).toEqual([
      { altitude: 0, direction: 27, speed: 10, oat: 25 },
    ]);
  });

  it('reports no wind profile for a fix the plan publishes none for', () => {
    const [entry] = mapPlannedRoute(plan([fix({ ident: 'EDDF' })]));

    expect(entry.wind.levels).toEqual([]);
  });

  it('converts the fuel of a plan generated in pounds to kilograms', () => {
    const [entry] = mapPlannedRoute(
      plan(
        [
          fix({
            ident: 'EDDF',
            fuel_flow: '17015',
            fuel_leg: '8866',
            fuel_totalused: '104627',
            fuel_min_onboard: '100554',
            fuel_plan_onboard: '106249',
          }),
        ],
        {},
        'lbs',
      ),
    );

    expect(entry.fuel).toEqual({
      flow: 7718,
      leg: 4022,
      used: 47458,
      minimumOnBoard: 45611,
      plannedOnBoard: 48194,
    });
  });

  it('leaves the fuel of a plan generated in kilograms', () => {
    const [entry] = mapPlannedRoute(
      plan([fix({ ident: 'EDDF', fuel_totalused: '47458' })]),
    );

    expect(entry.fuel.used).toBe(47458);
  });

  it('reads the conditions the plan omits as absent rather than zero', () => {
    const [entry] = mapPlannedRoute(plan([fix({ ident: 'EDDF' })]));

    expect(entry.fuel).toEqual({
      flow: null,
      leg: null,
      used: null,
      minimumOnBoard: null,
      plannedOnBoard: null,
    });
    expect(entry.oat).toBeNull();
    expect(entry.isaDeviation).toBeNull();
    expect(entry.tropopause).toBeNull();
    expect(entry.mora).toBeNull();
    expect(entry.fir).toBeNull();
    expect(entry.wind.direction).toBeNull();
    expect(entry.wind.speed).toBeNull();
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
      fuel: {
        flow: null,
        leg: null,
        used: null,
        minimumOnBoard: null,
        plannedOnBoard: null,
      },
      oat: null,
      isaDeviation: null,
      tropopause: null,
      mora: null,
      fir: null,
      wind: { direction: null, speed: null, levels: [] },
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
      params: { units: 'kgs' },
      origin: { icao_code: 'EDDF' },
      navlog: { fix: fix({ ident: 'EDDF' }) },
    } as OperationalFlightPlan);

    expect(route).toHaveLength(1);
    expect(route[0].ident).toBe('EDDF');
  });

  it('reports no route for a plan carrying no navlog', () => {
    expect(
      mapPlannedRoute({
        params: { units: 'kgs' },
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
