import {
  NavlogFix,
  OperationalFlightPlan,
} from '../../../core/provider/simbrief/type/simbrief.types';
import { toOfpArray } from './etops-snapshot.mapper';
import { PlannedRouteFix } from './planned-route.model';

const DEPARTURE_STAGE = 'CLB';

type UnorderedFix = Omit<PlannedRouteFix, 'ordinal'>;

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

function toFix(fix: NavlogFix): UnorderedFix | null {
  const latitude = readNumber(fix.pos_lat);
  const longitude = readNumber(fix.pos_long);

  if (latitude === null || longitude === null) {
    return null;
  }

  return {
    ident: fix.ident,
    latitude,
    longitude,
    altitude: readNumber(fix.altitude_feet) ?? 0,
    elapsedSeconds: readNumber(fix.time_total) ?? 0,
    distanceNm: readNumber(fix.distance),
    trackTrue: readNumber(fix.track_true),
    trackMag: readNumber(fix.track_mag),
    viaAirway: readText(fix.via_airway),
    stage: readText(fix.stage) ?? DEPARTURE_STAGE,
  };
}

function departureFix(
  origin: OperationalFlightPlan['origin'],
): UnorderedFix | null {
  const latitude = readNumber(origin.pos_lat);
  const longitude = readNumber(origin.pos_long);

  if (latitude === null || longitude === null) {
    return null;
  }

  return {
    ident: origin.icao_code,
    latitude,
    longitude,
    altitude: readNumber(origin.elevation) ?? 0,
    elapsedSeconds: 0,
    distanceNm: 0,
    trackTrue: null,
    trackMag: null,
    viaAirway: null,
    stage: DEPARTURE_STAGE,
  };
}

export function mapPlannedRoute(ofp: OperationalFlightPlan): PlannedRouteFix[] {
  const fixes = toOfpArray(ofp.navlog?.fix)
    .map(toFix)
    .filter((fix): fix is UnorderedFix => fix !== null);

  if (fixes.length === 0) {
    return [];
  }

  const departure =
    fixes[0].ident === ofp.origin.icao_code ? null : departureFix(ofp.origin);

  return [...(departure ? [departure] : []), ...fixes].map((fix, ordinal) => ({
    ...fix,
    ordinal,
  }));
}
