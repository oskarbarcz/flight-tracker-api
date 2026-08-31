export enum OceanicRouting {
  Track = 'track',
  TrackGeometry = 'track_geometry',
  Random = 'random',
}

export enum TrackDirection {
  East = 'east',
  West = 'west',
}

export type OceanicTrackFixSnapshot = {
  ident: string;
  latitude: number;
  longitude: number;
};

export type OceanicTrackSnapshot = {
  identifier: string;
  direction: TrackDirection;
  tmi: string;
  issuingOca: string | null;
  route: string | null;
  levels: number[];
  validFrom: Date | null;
  validTo: Date | null;
  fixes: OceanicTrackFixSnapshot[];
};

export type OceanicRoutingSnapshot = {
  routing: OceanicRouting;
  trackId: string | null;
  direction: TrackDirection | null;
};

export type OceanicSnapshot = OceanicRoutingSnapshot & {
  tracks: OceanicTrackSnapshot[];
};

export type FlightOceanicCrossing = OceanicRoutingSnapshot & {
  tracks: OceanicTrackSnapshot[];
};
