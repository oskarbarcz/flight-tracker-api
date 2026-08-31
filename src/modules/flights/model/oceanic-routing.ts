import {
  OperationalFlightPlan,
  RouteMapData,
} from '../../../core/provider/simbrief/type/simbrief.types';
import { toOfpArray } from './etops-snapshot.mapper';
import {
  OceanicRouting,
  OceanicRoutingSnapshot,
  TrackDirection,
} from './oceanic.model';

const NAT_AIRWAY = /^NAT([A-Z0-9]+)$/;

function readText(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

type PlannedTrack = { airway: string; trackId: string };

function plannedTrack(ofp: OperationalFlightPlan): PlannedTrack | null {
  for (const fix of toOfpArray(ofp.navlog?.fix)) {
    const airway = readText(fix.via_airway);
    const match = airway === null ? null : NAT_AIRWAY.exec(airway);

    if (airway !== null && match !== null) {
      return { airway, trackId: match[1] };
    }
  }

  return null;
}

function isFiled(route: string | null, airway: string): boolean {
  if (route === null) {
    return false;
  }

  return route.split(/\s+/).includes(airway);
}

export function resolveTrackDirection(
  mapData: RouteMapData | null,
): TrackDirection | null {
  const direction = readText(mapData?.tracksDirection)?.toUpperCase();

  if (direction === 'E') {
    return TrackDirection.East;
  }

  if (direction === 'W') {
    return TrackDirection.West;
  }

  return null;
}

export function resolveOceanicRouting(
  ofp: OperationalFlightPlan,
  mapData: RouteMapData | null,
): OceanicRoutingSnapshot {
  const direction = resolveTrackDirection(mapData);
  const planned = plannedTrack(ofp);

  if (planned === null) {
    return { routing: OceanicRouting.Random, trackId: null, direction };
  }

  const routing = isFiled(readText(ofp.atc?.route), planned.airway)
    ? OceanicRouting.Track
    : OceanicRouting.TrackGeometry;

  return { routing, trackId: planned.trackId, direction };
}
