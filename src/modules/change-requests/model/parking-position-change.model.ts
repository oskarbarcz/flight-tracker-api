import { ParkingPosition } from '../../airports/model/parking-position.model';

export const PARKING_POSITION_FIELDS = [
  'name',
  'terminalId',
  'bridge',
  'stairs',
  'deicing',
  'deicingDescription',
  'gpu',
  'pca',
  'type',
  'spotType',
  'assistance',
  'location',
  'noiseSensitivity',
  'noiseSensitivityText',
  'noiseSensitivityStartTime',
  'noiseSensitivityEndTime',
  'fuelingOptions',
  'coordinates',
] as const satisfies readonly (keyof ParkingPosition)[];

type ParkingPositionField = (typeof PARKING_POSITION_FIELDS)[number];

export type ParkingPositionValues = {
  [K in ParkingPositionField]-?: Exclude<ParkingPosition[K], undefined>;
};
