import { Terminal } from '../../airports/model/terminal.model';

export const TERMINAL_FIELDS = [
  'shortName',
  'fullName',
  'averageTaxiTime',
  'operatorCodes',
  'text',
  'shape',
] as const satisfies readonly (keyof Terminal)[];

type TerminalField = (typeof TERMINAL_FIELDS)[number];

export type TerminalValues = {
  [K in TerminalField]-?: Exclude<Terminal[K], undefined>;
};
