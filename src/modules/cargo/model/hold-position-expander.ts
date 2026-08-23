import {
  CargoDeck,
  CargoDoorSide,
  CompartmentLoading,
  HoldCompartment,
  HoldCompartmentName,
  HoldPosition,
  HoldPositionSide,
} from './hold-layout.model';
import { UldBaseCode, UldContourCode } from './uld-code.model';

export enum PositionOrdinals {
  Numeric = 'numeric',
  Alpha = 'alpha',
}

export const MAX_NUMERIC_ROWS = 9;
export const ALPHA_ORDINALS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

const SIDE_SUFFIX: Record<HoldPositionSide, string> = {
  [HoldPositionSide.Left]: 'L',
  [HoldPositionSide.Right]: 'R',
  [HoldPositionSide.Full]: 'P',
};

export type HoldPositionTemplate = {
  ordinals: PositionOrdinals;
  rows: number;
  sides: HoldPositionSide[];
  acceptedBases: UldBaseCode[];
  acceptedContours: UldContourCode[];
  maxWeightKg: number;
};

export type HoldPositionOverride = {
  designator: string;
  acceptedBases?: UldBaseCode[];
  acceptedContours?: UldContourCode[];
  maxWeightKg?: number;
};

export type SourceCompartment = {
  number: number;
  name: HoldCompartmentName;
  loading: CompartmentLoading;
  maxWeightKg: number;
  volumeM3: number;
  heated: boolean;
  ventilated: boolean;
  doorSide: CargoDoorSide;
  positionTemplate?: HoldPositionTemplate;
  positionOverrides?: HoldPositionOverride[];
};

export type SourceDeck = {
  deck: CargoDeck;
  compartments: SourceCompartment[];
};

export type SourceVariant = {
  id: string;
  isDefault: boolean;
  decks: SourceDeck[];
};

export type SourceHoldLayout = {
  type: string;
  variants: SourceVariant[];
};

export function ordinalToken(
  ordinals: PositionOrdinals,
  compartment: number,
  row: number,
): string {
  return ordinals === PositionOrdinals.Alpha
    ? ALPHA_ORDINALS[row - 1]
    : `${compartment}${row}`;
}

export function expandPositions(
  compartment: SourceCompartment,
): HoldPosition[] {
  const template = compartment.positionTemplate;

  if (!template) {
    return [];
  }

  const overrides = new Map(
    (compartment.positionOverrides ?? []).map((override) => [
      override.designator,
      override,
    ]),
  );

  const positions: HoldPosition[] = [];

  for (let row = 1; row <= template.rows; row++) {
    for (const side of template.sides) {
      const token = ordinalToken(template.ordinals, compartment.number, row);
      const designator = `${token}${SIDE_SUFFIX[side]}`;
      const override = overrides.get(designator);

      positions.push({
        designator,
        compartment: compartment.number,
        side,
        acceptedBases: override?.acceptedBases ?? template.acceptedBases,
        acceptedContours:
          override?.acceptedContours ?? template.acceptedContours,
        maxWeightKg: override?.maxWeightKg ?? template.maxWeightKg,
      });
    }
  }

  return positions;
}

export function expandCompartment(
  compartment: SourceCompartment,
): HoldCompartment {
  return {
    number: compartment.number,
    name: compartment.name,
    loading: compartment.loading,
    maxWeightKg: compartment.maxWeightKg,
    volumeM3: compartment.volumeM3,
    heated: compartment.heated,
    ventilated: compartment.ventilated,
    doorSide: compartment.doorSide,
    positions: expandPositions(compartment),
  };
}
