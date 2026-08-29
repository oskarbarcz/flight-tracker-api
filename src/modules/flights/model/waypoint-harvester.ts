import {
  NavlogFix,
  OceanicTrackFix,
  OperationalFlightPlan,
} from '../../../core/provider/simbrief/type/simbrief.types';
import { toOfpArray } from './etops-snapshot.mapper';
import {
  HarvestedWaypoint,
  WaypointKind,
} from '../../waypoints/model/waypoint.model';

const NAVAID_TYPES = new Set([
  'vor',
  'ndb',
  'dme',
  'vordme',
  'vortac',
  'tacan',
]);
const WAYPOINT_TYPES = new Set(['wpt', 'int', 'fix']);

function readText(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0
    ? value.trim()
    : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function kindOf(type: string | null): WaypointKind | null {
  if (type === null) {
    return null;
  }

  const normalised = type.toLowerCase();

  if (NAVAID_TYPES.has(normalised)) {
    return WaypointKind.Navaid;
  }

  return WAYPOINT_TYPES.has(normalised) ? WaypointKind.Waypoint : null;
}

function harvestNavlogFix(fix: NavlogFix): HarvestedWaypoint | null {
  const ident = readText(fix.ident);
  const kind = kindOf(readText(fix.type));
  const latitude = readNumber(fix.pos_lat);
  const longitude = readNumber(fix.pos_long);

  if (
    ident === null ||
    kind === null ||
    latitude === null ||
    longitude === null
  ) {
    return null;
  }

  return {
    ident,
    icaoRegion: readText(fix.icao_region),
    kind,
    latitude,
    longitude,
    frequency: kind === WaypointKind.Navaid ? readNumber(fix.frequency) : null,
  };
}

function harvestTrackFix(fix: OceanicTrackFix): HarvestedWaypoint | null {
  const ident = readText(fix.ident);
  const latitude = readNumber(fix.pos_lat);
  const longitude = readNumber(fix.pos_long);

  if (ident === null || latitude === null || longitude === null) {
    return null;
  }

  if (isCoordinateNamed(ident)) {
    return null;
  }

  return {
    ident,
    icaoRegion: null,
    kind: WaypointKind.Waypoint,
    latitude,
    longitude,
    frequency: null,
  };
}

export function isCoordinateNamed(ident: string): boolean {
  return (
    /^\d{2,4}[NS]?\d{0,5}[EW]?$/.test(ident) ||
    /^\d{2}[NS]\d{3}[EW]$/.test(ident)
  );
}

export function harvestWaypoints(
  ofp: OperationalFlightPlan,
): HarvestedWaypoint[] {
  const harvested: HarvestedWaypoint[] = [];

  for (const fix of toOfpArray(ofp.navlog?.fix)) {
    const waypoint = harvestNavlogFix(fix);

    if (waypoint !== null) {
      harvested.push(waypoint);
    }
  }

  for (const navlog of toOfpArray(ofp.alternate_navlog)) {
    for (const fix of toOfpArray(navlog.fix)) {
      const waypoint = harvestNavlogFix(fix);

      if (waypoint !== null) {
        harvested.push(waypoint);
      }
    }
  }

  for (const track of toOfpArray(ofp.tracks?.nat)) {
    const fixes = track.fixes;

    if (fixes === undefined || !('fix' in fixes)) {
      continue;
    }

    for (const fix of toOfpArray(fixes.fix)) {
      const waypoint = harvestTrackFix(fix);

      if (waypoint !== null) {
        harvested.push(waypoint);
      }
    }
  }

  return dedupe(harvested);
}

const SAME_POSITION_DEGREES = 0.01;

function dedupe(waypoints: HarvestedWaypoint[]): HarvestedWaypoint[] {
  const byKey = new Map<string, HarvestedWaypoint>();

  for (const waypoint of waypoints) {
    byKey.set(`${waypoint.ident}|${waypoint.icaoRegion ?? ''}`, waypoint);
  }

  return adoptRegionFromRoute([...byKey.values()]);
}

// A waypoint on the route arrives with its ICAO region; the same waypoint in the oceanic track
// structure arrives without one. Within a single plan they are the same place, so the regionless
// copy is dropped rather than catalogued as a second waypoint.
function adoptRegionFromRoute(
  waypoints: HarvestedWaypoint[],
): HarvestedWaypoint[] {
  const withRegion = waypoints.filter((w) => w.icaoRegion !== null);

  return waypoints.filter((waypoint) => {
    if (waypoint.icaoRegion !== null) {
      return true;
    }

    return !withRegion.some(
      (candidate) =>
        candidate.ident === waypoint.ident &&
        Math.abs(candidate.latitude - waypoint.latitude) <
          SAME_POSITION_DEGREES &&
        Math.abs(candidate.longitude - waypoint.longitude) <
          SAME_POSITION_DEGREES,
    );
  });
}
