import {
  OceanicTrack,
  OperationalFlightPlan,
} from '../../../core/provider/simbrief/type/simbrief.types';
import { toOfpArray } from './etops-snapshot.mapper';
import {
  OceanicTrackFixSnapshot,
  OceanicTrackSnapshot,
  TrackDirection,
} from './oceanic.model';

function readText(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

function readNumber(value: unknown): number | null {
  if (typeof value !== 'string' && typeof value !== 'number') {
    return null;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed) ? parsed : null;
}

function readInstant(value: unknown): Date | null {
  const seconds = readNumber(value);

  return seconds === null ? null : new Date(seconds * 1000);
}

function readDirection(value: unknown): TrackDirection | null {
  const group = readText(value)?.toLowerCase();

  if (group === 'east') {
    return TrackDirection.East;
  }

  if (group === 'west') {
    return TrackDirection.West;
  }

  return null;
}

function readLevels(value: unknown): number[] {
  const levels = readText(value);

  if (levels === null) {
    return [];
  }

  return levels
    .split(/\s+/)
    .map((level) => readNumber(level))
    .filter((level): level is number => level !== null);
}

function readFixes(track: OceanicTrack): OceanicTrackFixSnapshot[] {
  const fixes =
    track.fixes && 'fix' in track.fixes ? track.fixes.fix : undefined;

  return toOfpArray(fixes)
    .map((fix) => {
      const latitude = readNumber(fix.pos_lat);
      const longitude = readNumber(fix.pos_long);

      if (latitude === null || longitude === null) {
        return null;
      }

      return { ident: fix.ident, latitude, longitude };
    })
    .filter((fix): fix is OceanicTrackFixSnapshot => fix !== null);
}

function toTrack(track: OceanicTrack): OceanicTrackSnapshot | null {
  const direction = readDirection(track.group);
  const tmi = readText(track.tmi);

  if (direction === null || tmi === null) {
    return null;
  }

  return {
    identifier: track.id,
    direction,
    tmi,
    issuingOca: readText(track.addr),
    route: readText(track.route),
    levels: readLevels(track.levels),
    validFrom: readInstant(track.start),
    validTo: readInstant(track.end),
    fixes: readFixes(track),
  };
}

export function mapOceanicTracks(
  ofp: OperationalFlightPlan,
): OceanicTrackSnapshot[] {
  return toOfpArray(ofp.tracks?.nat)
    .map(toTrack)
    .filter((track): track is OceanicTrackSnapshot => track !== null);
}
