import {
  Etops,
  EtopsCriticalPoint,
  EtopsDiversionAirport,
  EtopsEqualTimePoint,
  EtopsSuitableAirport,
  EtopsThresholdPoint,
  RouteMapData,
} from '../../../core/provider/simbrief/type/simbrief.types';
import {
  EtopsAirportSnapshot,
  EtopsPointKind,
  EtopsPointSnapshot,
  EtopsRings,
} from './etops.model';

const POSITION_TOLERANCE_DEGREES = 0.001;

export type AirportIdResolver = (icaoCode: string) => string | undefined;

export function toOfpArray<T>(value: T | T[] | undefined | null): T[] {
  if (value === undefined || value === null) {
    return [];
  }

  return Array.isArray(value) ? value : [value];
}

function readNumber(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function readText(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function samePosition(
  first: { latitude: number; longitude: number },
  second: { latitude: number; longitude: number },
): boolean {
  return (
    Math.abs(first.latitude - second.latitude) < POSITION_TOLERANCE_DEGREES &&
    Math.abs(first.longitude - second.longitude) < POSITION_TOLERANCE_DEGREES
  );
}

function mapDiversionAirports(
  value: EtopsDiversionAirport[] | EtopsDiversionAirport | undefined,
  resolveAirportId: AirportIdResolver,
): EtopsPointSnapshot['diversionAirports'] {
  const mapped: EtopsPointSnapshot['diversionAirports'] = [];

  for (const airport of toOfpArray(value)) {
    const airportId = resolveAirportId(airport.icao_code);

    if (airportId === undefined) {
      continue;
    }

    mapped.push({ airportId, ordinal: mapped.length + 1 });
  }

  return mapped;
}

function mapThresholdPoint(
  point: EtopsThresholdPoint | undefined,
  kind: EtopsPointKind,
  resolveAirportId: AirportIdResolver,
): EtopsPointSnapshot | null {
  if (!point) {
    return null;
  }

  const latitude = readNumber(point.pos_lat_fix);
  const longitude = readNumber(point.pos_long_fix);
  const elapsedSeconds = readNumber(point.elapsed_time);

  if (latitude === null || longitude === null || elapsedSeconds === null) {
    return null;
  }

  return {
    kind,
    ordinal: 1,
    isCritical: false,
    adequateAirportId: resolveAirportId(point.icao_code) ?? null,
    position: { latitude, longitude },
    elapsedSeconds,
    condition: readText(point.etops_condition),
    diversionAirports: mapDiversionAirports(
      point.div_airport,
      resolveAirportId,
    ),
  };
}

function mapEqualTimePoint(
  point: EtopsEqualTimePoint,
  ordinal: number,
  resolveAirportId: AirportIdResolver,
): EtopsPointSnapshot | null {
  const latitude = readNumber(point.pos_lat);
  const longitude = readNumber(point.pos_long);
  const elapsedSeconds = readNumber(point.elapsed_time);

  if (latitude === null || longitude === null || elapsedSeconds === null) {
    return null;
  }

  return {
    kind: EtopsPointKind.EqualTime,
    ordinal,
    isCritical: false,
    adequateAirportId: null,
    position: { latitude, longitude },
    elapsedSeconds,
    condition: readText(point.etops_condition),
    diversionAirports: mapDiversionAirports(
      point.div_airport,
      resolveAirportId,
    ),
  };
}

function applyCriticalPoint(
  points: EtopsPointSnapshot[],
  criticalPoint: EtopsCriticalPoint | undefined,
): EtopsPointSnapshot[] {
  const latitude = readNumber(criticalPoint?.pos_lat);
  const longitude = readNumber(criticalPoint?.pos_long);

  if (latitude === null || longitude === null) {
    return points;
  }

  const position = { latitude, longitude };
  const coinciding = points.find((point) =>
    samePosition(point.position, position),
  );

  if (coinciding) {
    coinciding.isCritical = true;

    return points;
  }

  const elapsedSeconds = readNumber(criticalPoint?.elapsed_time);

  if (elapsedSeconds === null) {
    return points;
  }

  return [
    ...points,
    {
      kind: EtopsPointKind.Critical,
      ordinal: 1,
      isCritical: true,
      adequateAirportId: null,
      position,
      elapsedSeconds,
      condition: null,
      diversionAirports: [],
    },
  ];
}

export function mapEtopsPoints(
  etops: Etops | undefined,
  resolveAirportId: AirportIdResolver,
): EtopsPointSnapshot[] {
  if (!etops) {
    return [];
  }

  const points: EtopsPointSnapshot[] = [];
  const entry = mapThresholdPoint(
    etops.entry,
    EtopsPointKind.Entry,
    resolveAirportId,
  );
  const exit = mapThresholdPoint(
    etops.exit,
    EtopsPointKind.Exit,
    resolveAirportId,
  );

  if (entry) {
    points.push(entry);
  }

  toOfpArray(etops.equal_time_point).forEach((point, index) => {
    const mapped = mapEqualTimePoint(point, index + 1, resolveAirportId);

    if (mapped) {
      points.push(mapped);
    }
  });

  if (exit) {
    points.push(exit);
  }

  return applyCriticalPoint(points, etops.critical_point);
}

export function mapEtopsAirports(
  etops: Etops | undefined,
  resolveAirportId: AirportIdResolver,
): EtopsAirportSnapshot[] {
  const mapped: EtopsAirportSnapshot[] = [];

  for (const airport of toOfpArray(etops?.suitable_airport)) {
    const snapshot = mapEtopsAirport(airport, resolveAirportId);

    if (snapshot !== null) {
      mapped.push(snapshot);
    }
  }

  return mapped;
}

function mapEtopsAirport(
  airport: EtopsSuitableAirport,
  resolveAirportId: AirportIdResolver,
): EtopsAirportSnapshot | null {
  const airportId = resolveAirportId(airport.icao_code);
  const suitabilityStart = readDate(airport.suitability_start);
  const suitabilityEnd = readDate(airport.suitability_end);

  if (
    airportId === undefined ||
    suitabilityStart === null ||
    suitabilityEnd === null
  ) {
    return null;
  }

  return {
    airportId,
    suitabilityStart,
    suitabilityEnd,
    plannedRunway: readText(airport.plan_rwy),
    forecastCeiling: readNumber(airport.fcst_cig),
    forecastVisibility: readNumber(airport.fcst_vis),
    transitionAltitude: readNumber(airport.trans_alt),
    transitionLevel: readNumber(airport.trans_level),
  };
}

function readDate(value: unknown): Date | null {
  const text = readText(value);

  if (text === null) {
    return null;
  }

  const date = new Date(text);

  return Number.isNaN(date.getTime()) ? null : date;
}

export function mapEtopsRings(
  etops: Etops | undefined,
  mapData: RouteMapData | null,
): EtopsRings {
  return {
    ruleMinutes: readNumber(etops?.rule) ?? mapData?.etopsRule ?? null,
    ruleDistanceNm: mapData?.etopsRuleDistance ?? null,
    thresholdMinutes: mapData?.etopsThresholdMinutes ?? null,
  };
}

export function thresholdRingDistanceNm(rings: EtopsRings): number | null {
  const { ruleDistanceNm, ruleMinutes, thresholdMinutes } = rings;

  if (
    ruleDistanceNm === null ||
    ruleMinutes === null ||
    thresholdMinutes === null ||
    ruleMinutes === 0
  ) {
    return null;
  }

  return (ruleDistanceNm * thresholdMinutes) / ruleMinutes;
}
