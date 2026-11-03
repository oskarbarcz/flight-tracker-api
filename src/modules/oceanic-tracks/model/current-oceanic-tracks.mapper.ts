import {
  OceanicTracksDirection,
  OceanicTracksSet,
  OceanicTracksSystem,
  OceanicTracksTrack,
} from '../../../core/provider/oceanic-tracks/type/oceanic-tracks.types';
import { TrackDirection } from '../../flights/model/oceanic.model';
import {
  CurrentOceanicTrack,
  CurrentOceanicTracks,
  OceanicTrackSystem,
} from './oceanic-track.model';

const SYSTEMS: Record<OceanicTracksSystem, OceanicTrackSystem> = {
  pacots: OceanicTrackSystem.Pacots,
};

const DIRECTIONS: Record<OceanicTracksDirection, TrackDirection> = {
  east: TrackDirection.East,
  west: TrackDirection.West,
};

function toTrack(track: OceanicTracksTrack): CurrentOceanicTrack {
  return {
    system: SYSTEMS[track.system],
    identifier: track.identifier,
    direction: DIRECTIONS[track.direction],
    issuingAuthority: track.issuingAuthority,
    notamNumber: track.notamNumber,
    validFrom: new Date(track.validFrom),
    validTo: new Date(track.validTo),
    route: track.route,
    levels: track.levels,
    fixes: track.fixes.map(({ ident, latitude, longitude }) => ({
      ident,
      latitude,
      longitude,
    })),
    unresolvedFixes: track.unresolvedFixes,
    remarks: track.remarks,
    message: track.message,
  };
}

export function mapCurrentOceanicTracks(
  set: OceanicTracksSet,
): CurrentOceanicTracks {
  return {
    fetchedAt: new Date(set.fetchedAt),
    tracks: set.tracks.map(toTrack),
  };
}
