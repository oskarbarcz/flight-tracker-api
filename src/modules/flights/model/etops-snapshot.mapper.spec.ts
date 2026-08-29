import { Etops } from '../../../core/provider/simbrief/type/simbrief.types';
import {
  mapEtopsAirports,
  mapEtopsPoints,
  mapEtopsRings,
  thresholdRingDistanceNm,
} from './etops-snapshot.mapper';
import { EtopsPointKind } from './etops.model';

const airportIds: Record<string, string> = {
  CYYT: 'id-cyyt',
  CYQX: 'id-cyqx',
  EINN: 'id-einn',
};

const resolveAirportId = (icaoCode: string): string | undefined =>
  airportIds[icaoCode];

const referenceEtops: Etops = {
  rule: '370',
  entry: {
    icao_code: 'CYYT',
    pos_lat_apt: '47.623667',
    pos_long_apt: '-52.771667',
    pos_lat_fix: '51.754917230472',
    pos_long_fix: '-43.458354990837',
    elapsed_time: '9735',
    etops_condition: 'DC',
    div_airport: { icao_code: 'CYQX' },
  },
  exit: {
    icao_code: 'EINN',
    pos_lat_apt: '52.710008',
    pos_long_apt: '-8.907742',
    pos_lat_fix: '52.943918222079',
    pos_long_fix: '-20.931923556096',
    elapsed_time: '15372',
    etops_condition: 'DC',
    div_airport: { icao_code: 'EINN' },
  },
  equal_time_point: {
    pos_lat: '52.095984771429',
    pos_long: '-33.466876671682',
    elapsed_time: '12186',
    etops_condition: 'DC',
    div_airport: [{ icao_code: 'CYQX' }, { icao_code: 'EINN' }],
  },
  critical_point: {
    fix_type: 'ETP',
    pos_lat: '52.095984771429',
    pos_long: '-33.466876671682',
    elapsed_time: '12186',
  },
};

describe('ETOPS point mapping', () => {
  it('reads the entry position from the fix, not from its adequate airport', () => {
    const [entry] = mapEtopsPoints(referenceEtops, resolveAirportId);

    expect(entry.kind).toBe(EtopsPointKind.Entry);
    expect(entry.position.latitude).toBeCloseTo(51.754917, 5);
    expect(entry.position.longitude).toBeCloseTo(-43.458355, 5);
  });

  it('names the adequate airport and the diversion airport apart at the entry point', () => {
    const [entry] = mapEtopsPoints(referenceEtops, resolveAirportId);

    expect(entry.adequateAirportId).toBe('id-cyyt');
    expect(entry.diversionAirports).toEqual([
      { airportId: 'id-cyqx', ordinal: 1 },
    ]);
  });

  it('reads the equal-time point from its own position fields', () => {
    const points = mapEtopsPoints(referenceEtops, resolveAirportId);
    const etp = points.find((p) => p.kind === EtopsPointKind.EqualTime);

    expect(etp?.position.latitude).toBeCloseTo(52.095985, 5);
    expect(etp?.position.longitude).toBeCloseTo(-33.466877, 5);
  });

  it('gives the equal-time point no adequate airport', () => {
    const points = mapEtopsPoints(referenceEtops, resolveAirportId);
    const etp = points.find((p) => p.kind === EtopsPointKind.EqualTime);

    expect(etp?.adequateAirportId).toBeNull();
  });

  it('names both airports at the equal-time point', () => {
    const points = mapEtopsPoints(referenceEtops, resolveAirportId);
    const etp = points.find((p) => p.kind === EtopsPointKind.EqualTime);

    expect(etp?.diversionAirports).toEqual([
      { airportId: 'id-cyqx', ordinal: 1 },
      { airportId: 'id-einn', ordinal: 2 },
    ]);
  });

  it('gives every point a position', () => {
    const points = mapEtopsPoints(referenceEtops, resolveAirportId);

    expect(points).not.toHaveLength(0);
    for (const point of points) {
      expect(Number.isFinite(point.position.latitude)).toBe(true);
      expect(Number.isFinite(point.position.longitude)).toBe(true);
    }
  });

  it('stores the condition as published', () => {
    const [entry] = mapEtopsPoints(referenceEtops, resolveAirportId);

    expect(entry.condition).toBe('DC');
  });

  it('collects nothing from a plan without an ETOPS section', () => {
    expect(mapEtopsPoints(undefined, resolveAirportId)).toEqual([]);
  });

  it('orders more than one equal-time point as the plan numbers them', () => {
    const points = mapEtopsPoints(
      {
        ...referenceEtops,
        equal_time_point: [
          { pos_lat: '52.0', pos_long: '-33.0', elapsed_time: '12186' },
          { pos_lat: '53.0', pos_long: '-25.0', elapsed_time: '14000' },
        ],
      },
      resolveAirportId,
    );
    const etps = points.filter((p) => p.kind === EtopsPointKind.EqualTime);

    expect(etps.map((p) => p.ordinal)).toEqual([1, 2]);
  });
});

describe('ETOPS critical point resolution', () => {
  it('marks the coinciding point rather than storing a second at the same position', () => {
    const points = mapEtopsPoints(referenceEtops, resolveAirportId);

    expect(points).toHaveLength(3);
    expect(points.filter((p) => p.isCritical)).toHaveLength(1);
    expect(points.find((p) => p.isCritical)?.kind).toBe(
      EtopsPointKind.EqualTime,
    );
  });

  it('stores a critical point of its own where it matches no other point', () => {
    const points = mapEtopsPoints(
      {
        ...referenceEtops,
        critical_point: {
          fix_type: 'CP',
          pos_lat: '48.0',
          pos_long: '-40.0',
          elapsed_time: '11000',
        },
      },
      resolveAirportId,
    );
    const critical = points.find((p) => p.isCritical);

    expect(points).toHaveLength(4);
    expect(critical?.kind).toBe(EtopsPointKind.Critical);
    expect(critical?.position.latitude).toBeCloseTo(48, 5);
  });

  it('marks exactly one point critical in both cases', () => {
    for (const etops of [
      referenceEtops,
      {
        ...referenceEtops,
        critical_point: {
          pos_lat: '48.0',
          pos_long: '-40.0',
          elapsed_time: '11000',
        },
      },
    ]) {
      const points = mapEtopsPoints(etops, resolveAirportId);

      expect(points.filter((p) => p.isCritical)).toHaveLength(1);
    }
  });

  it('marks no point where the plan names no critical point', () => {
    const points = mapEtopsPoints(
      { ...referenceEtops, critical_point: undefined },
      resolveAirportId,
    );

    expect(points.filter((p) => p.isCritical)).toHaveLength(0);
  });
});

describe('ETOPS range rings', () => {
  it('derives the threshold ring from the rule radius', () => {
    const rings = mapEtopsRings(referenceEtops, {
      etopsRuleDistance: 2694.8333333333,
      etopsThresholdMinutes: 60,
    });

    expect(rings.ruleMinutes).toBe(370);
    expect(thresholdRingDistanceNm(rings)).toBeCloseTo(437.0, 1);
  });

  it('places the entry and exit fixes on the threshold ring', () => {
    const rings = mapEtopsRings(referenceEtops, {
      etopsRuleDistance: 2694.8333333333,
      etopsThresholdMinutes: 60,
    });
    const ring = thresholdRingDistanceNm(rings) as number;

    const entryDistance = distanceNm(
      47.623667,
      -52.771667,
      51.754917,
      -43.458355,
    );
    const exitDistance = distanceNm(
      52.710008,
      -8.907742,
      52.943918,
      -20.931924,
    );

    expect(Math.abs(entryDistance - ring)).toBeLessThan(2);
    expect(Math.abs(exitDistance - ring)).toBeLessThan(2);
  });

  it('reports no ring where the companion map file was unavailable', () => {
    const rings = mapEtopsRings(referenceEtops, null);

    expect(rings.ruleMinutes).toBe(370);
    expect(rings.ruleDistanceNm).toBeNull();
    expect(thresholdRingDistanceNm(rings)).toBeNull();
  });
});

describe('ETOPS suitable airport mapping', () => {
  it('maps the suitability window and the forecast for it', () => {
    const [airport] = mapEtopsAirports(
      {
        ...referenceEtops,
        suitable_airport: {
          icao_code: 'CYQX',
          plan_rwy: '21',
          fcst_cig: '900',
          fcst_vis: '8050',
          trans_alt: '18000',
          trans_level: '18000',
          suitability_start: '2026-08-24T23:01:41Z',
          suitability_end: '2026-08-25T02:52:17Z',
        },
      },
      resolveAirportId,
    );

    expect(airport.airportId).toBe('id-cyqx');
    expect(airport.plannedRunway).toBe('21');
    expect(airport.forecastCeiling).toBe(900);
    expect(airport.forecastVisibility).toBe(8050);
    expect(airport.suitabilityStart.toISOString()).toBe(
      '2026-08-24T23:01:41.000Z',
    );
  });

  it('keeps each airport its own window', () => {
    const airports = mapEtopsAirports(
      {
        ...referenceEtops,
        suitable_airport: [
          {
            icao_code: 'CYQX',
            suitability_start: '2026-08-24T23:01:41Z',
            suitability_end: '2026-08-25T02:52:17Z',
          },
          {
            icao_code: 'EINN',
            suitability_start: '2026-08-25T00:52:17Z',
            suitability_end: '2026-08-25T02:52:17Z',
          },
        ],
      },
      resolveAirportId,
    );

    expect(airports).toHaveLength(2);
    expect(airports[0].suitabilityStart).not.toEqual(
      airports[1].suitabilityStart,
    );
  });

  it('skips an airport the plan names without a suitability window', () => {
    const airports = mapEtopsAirports(
      { ...referenceEtops, suitable_airport: { icao_code: 'CYQX' } },
      resolveAirportId,
    );

    expect(airports).toEqual([]);
  });
});

function distanceNm(
  fromLat: number,
  fromLong: number,
  toLat: number,
  toLong: number,
): number {
  const toRadians = (value: number): number => (value * Math.PI) / 180;
  const deltaLat = toRadians(toLat - fromLat);
  const deltaLong = toRadians(toLong - fromLong);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRadians(fromLat)) *
      Math.cos(toRadians(toLat)) *
      Math.sin(deltaLong / 2) ** 2;

  return 2 * Math.asin(Math.sqrt(a)) * 3440.065;
}
