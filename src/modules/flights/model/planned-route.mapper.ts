import {
  NavlogFix,
  NavlogWindLevel,
  OperationalFlightPlan,
} from '../../../core/provider/simbrief/type/simbrief.types';
import { toOfpArray } from './etops-snapshot.mapper';
import { PlannedRouteFix, PlannedRouteWindLevel } from './planned-route.model';
import { OfpMassUnit, readOfpMassUnit, toKilograms } from './ofp-units';

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

function toWindLevel(level: NavlogWindLevel): PlannedRouteWindLevel | null {
  const altitude = readNumber(level.altitude);
  const direction = readNumber(level.wind_dir);
  const speed = readNumber(level.wind_spd);
  const oat = readNumber(level.oat);

  if (
    altitude === null ||
    direction === null ||
    speed === null ||
    oat === null
  ) {
    return null;
  }

  return { altitude, direction, speed, oat };
}

function toWindLevels(fix: NavlogFix): PlannedRouteWindLevel[] {
  const windData = fix.wind_data;

  if (windData === undefined || !('level' in windData)) {
    return [];
  }

  return toOfpArray(windData.level)
    .map(toWindLevel)
    .filter((level): level is PlannedRouteWindLevel => level !== null);
}

function readMass(value: unknown, unit: OfpMassUnit): number | null {
  const mass = readNumber(value);

  return mass === null ? null : toKilograms(mass, unit);
}

function toFix(fix: NavlogFix, unit: OfpMassUnit): UnorderedFix | null {
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
    fuel: {
      flow: readMass(fix.fuel_flow, unit),
      leg: readMass(fix.fuel_leg, unit),
      used: readMass(fix.fuel_totalused, unit),
      minimumOnBoard: readMass(fix.fuel_min_onboard, unit),
      plannedOnBoard: readMass(fix.fuel_plan_onboard, unit),
    },
    oat: readNumber(fix.oat),
    isaDeviation: readNumber(fix.oat_isa_dev),
    tropopause: readNumber(fix.tropopause_feet),
    mora: readNumber(fix.mora),
    fir: readText(fix.fir),
    wind: {
      direction: readNumber(fix.wind_dir),
      speed: readNumber(fix.wind_spd),
      levels: toWindLevels(fix),
    },
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
  };
}

export function mapPlannedRoute(ofp: OperationalFlightPlan): PlannedRouteFix[] {
  const unit = readOfpMassUnit(ofp);
  const fixes = toOfpArray(ofp.navlog?.fix)
    .map((fix) => toFix(fix, unit))
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
