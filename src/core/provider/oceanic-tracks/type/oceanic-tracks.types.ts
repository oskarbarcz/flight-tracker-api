export type OceanicTracksErrorCode =
  | 'NMS_UNAVAILABLE'
  | 'FIX_DIRECTORY_UNAVAILABLE'
  | 'NMS_NOT_CONFIGURED'
  | 'INTERNAL_ERROR';

export type OceanicTracksSystem = 'pacots';

export type OceanicTracksDirection = 'east' | 'west';

export interface OceanicTracksFix {
  ident: string;
  latitude: number;
  longitude: number;
}

export interface OceanicTracksTrack {
  system: OceanicTracksSystem;
  identifier: string;
  direction: OceanicTracksDirection;
  issuingAuthority: string;
  notamNumber: string;
  validFrom: string;
  validTo: string;
  route: string;
  levels: number[];
  fixes: OceanicTracksFix[];
  unresolvedFixes: string[];
  remarks: string | null;
  message: string;
}

export interface OceanicTracksSet {
  fetchedAt: string;
  tracks: OceanicTracksTrack[];
  unreadableMessages: string[];
}

export interface OceanicTracksErrorBody {
  error: {
    code: OceanicTracksErrorCode;
    message: string;
    status: number;
  };
}
