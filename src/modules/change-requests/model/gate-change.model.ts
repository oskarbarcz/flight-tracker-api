import { Gate } from '../../airports/model/gate.model';

export const GATE_FIELDS = [
  'name',
  'category',
  'terminalId',
  'parkingPositionId',
  'coordinates',
] as const satisfies readonly (keyof Gate)[];

type GateField = (typeof GATE_FIELDS)[number];

export type GateValues = {
  [K in GateField]-?: Exclude<Gate[K], undefined>;
};
