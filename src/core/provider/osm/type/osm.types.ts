export type OsmErrorCode =
  | 'BAD_REQUEST'
  | 'METHOD_NOT_ALLOWED'
  | 'AERODROME_NOT_FOUND'
  | 'OVERPASS_UNAVAILABLE'
  | 'RESULT_TOO_LARGE'
  | 'INTERNAL_ERROR';

export type OsmSection =
  | 'location'
  | 'shape'
  | 'runways'
  | 'terminals'
  | 'parkingPositions'
  | 'gates';

export type OsmSurfaceType =
  | 'asphalt'
  | 'concrete'
  | 'grass'
  | 'gravel'
  | 'unknown';

export type OsmLightingType = 'HIRL' | 'MIRL' | 'LIRL' | 'ALS' | 'unknown';

export type OsmYesNo = 'yes' | 'no';

export type OsmStairs =
  | 'no'
  | 'with-bus-transport'
  | 'with-passenger-walking'
  | 'with-bus-or-passenger-walking';

export type OsmDeicing = 'no' | 'possible' | 'recommended' | 'mandatory';

export type OsmGroundSupply = 'no' | 'bridge' | 'standalone' | 'both';

export type OsmParkingPositionType =
  | 'angled'
  | 'straight-in'
  | 'angled-taxi-through'
  | 'straight-in-taxi-through';

export type OsmParkingSpotType = 'passenger' | 'cargo' | 'other';

export type OsmParkingAssistance =
  | 'none'
  | 'vdgs'
  | 'marshaller'
  | 'vdgs-or-marshaller';

export type OsmParkingLocation = 'remote' | 'gate';

export type OsmGateCategory =
  | 'schengen'
  | 'non-schengen'
  | 'domestic'
  | 'international';

export type OsmFuelingOption = 'none' | 'truck' | 'hydrant';

export interface OsmCoordinates {
  longitude: number;
  latitude: number;
}

export interface OsmRunway {
  designator: string;
  length: number;
  width: number;
  magneticHeading: number;
  trueHeading: number;
  elevation?: number;
  surfaceType: OsmSurfaceType;
  lightingType: OsmLightingType;
  coordinates: OsmCoordinates;
}

export interface OsmTerminal {
  shortName: string;
  fullName: string;
  averageTaxiTime: number;
  operatorCodes: string[];
  text?: string;
  shape?: OsmCoordinates[];
}

export interface OsmParkingPosition {
  name: string;
  terminal: string;
  bridge: OsmYesNo;
  stairs: OsmStairs;
  deicing: OsmDeicing;
  gpu: OsmGroundSupply;
  pca: OsmGroundSupply;
  type: OsmParkingPositionType;
  spotType: OsmParkingSpotType;
  assistance: OsmParkingAssistance;
  location: OsmParkingLocation;
  noiseSensitivity: OsmYesNo;
  fuelingOptions: OsmFuelingOption;
  coordinates: OsmCoordinates;
}

export interface OsmGate {
  name: string;
  category: OsmGateCategory;
  terminal: string;
  parkingPosition: string | null;
  coordinates: OsmCoordinates;
}

export interface OsmAirportData {
  icaoCode: string;
  name: string | null;
  source: string;
  location?: OsmCoordinates;
  shape?: OsmCoordinates[];
  runways: OsmRunway[];
  terminals: OsmTerminal[];
  parkingPositions: OsmParkingPosition[];
  gates: OsmGate[];
}

export interface OsmAirportResponse {
  airport: OsmAirportData;
}

export interface OsmErrorBody {
  error: {
    code: OsmErrorCode;
    message: string;
    status: number;
  };
}
