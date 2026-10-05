import { Runway } from '../../airports/model/runway.model';

export const RUNWAY_FIELDS = [
  'designator',
  'length',
  'width',
  'displace',
  'trueHeading',
  'magneticHeading',
  'elevation',
  'surfaceType',
  'lightingType',
  'coordinates',
] as const satisfies readonly (keyof Runway)[];

type RunwayField = (typeof RUNWAY_FIELDS)[number];

export type RunwayValues = {
  [K in RunwayField]-?: Exclude<Runway[K], undefined>;
};
