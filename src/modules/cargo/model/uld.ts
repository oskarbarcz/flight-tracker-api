import { HoldPosition } from './hold-layout.model';
import { UldBaseCode, UldContourCode } from './uld-code.model';
import { UldCapacity } from './cargo-volume';

export enum UldType {
  Ld3 = 'AKE',
  Ld3Reduced = 'AKH',
  Ld3Active = 'RKN',
  Pallet96 = 'PMC',
  Pallet88 = 'PAG',
  MainDeck = 'AMA',
  PalletActive = 'RAP',
}

export type UldSpec = {
  type: UldType;
  base: UldBaseCode;
  contour: UldContourCode;
  tareKg: number;
  maxGrossKg: number;
  volumeM3: number;
  active: boolean;
};

export const ULD_SPECS: Record<UldType, UldSpec> = {
  [UldType.Ld3]: {
    type: UldType.Ld3,
    base: UldBaseCode.Ld3,
    contour: UldContourCode.Ld3FullHeight,
    tareKg: 82,
    maxGrossKg: 1588,
    volumeM3: 4.3,
    active: false,
  },
  [UldType.Ld3Reduced]: {
    type: UldType.Ld3Reduced,
    base: UldBaseCode.Ld3,
    contour: UldContourCode.Ld3ReducedHeight,
    tareKg: 75,
    maxGrossKg: 1588,
    volumeM3: 3.4,
    active: false,
  },
  [UldType.Ld3Active]: {
    type: UldType.Ld3Active,
    base: UldBaseCode.Ld3,
    contour: UldContourCode.Ld3Active,
    tareKg: 250,
    maxGrossKg: 1588,
    volumeM3: 1.5,
    active: true,
  },
  [UldType.Pallet96]: {
    type: UldType.Pallet96,
    base: UldBaseCode.Pallet96,
    contour: UldContourCode.Pallet96Contoured,
    tareKg: 120,
    maxGrossKg: 6800,
    volumeM3: 11,
    active: false,
  },
  [UldType.Pallet88]: {
    type: UldType.Pallet88,
    base: UldBaseCode.Pallet88,
    contour: UldContourCode.Pallet88Contoured,
    tareKg: 105,
    maxGrossKg: 6800,
    volumeM3: 10,
    active: false,
  },
  [UldType.MainDeck]: {
    type: UldType.MainDeck,
    base: UldBaseCode.Pallet96,
    contour: UldContourCode.MainDeckContainer,
    tareKg: 300,
    maxGrossKg: 6804,
    volumeM3: 17.6,
    active: false,
  },
  [UldType.PalletActive]: {
    type: UldType.PalletActive,
    base: UldBaseCode.Pallet88,
    contour: UldContourCode.Pallet96Active,
    tareKg: 570,
    maxGrossKg: 4500,
    volumeM3: 6,
    active: true,
  },
};

const SERIAL_LENGTH = 5;

export function uldSpecsFor(position: HoldPosition): UldSpec[] {
  return Object.values(ULD_SPECS).filter(
    (spec) =>
      position.acceptedBases.includes(spec.base) &&
      position.acceptedContours.includes(spec.contour),
  );
}

export function fits(spec: UldSpec, position: HoldPosition): boolean {
  return (
    position.acceptedBases.includes(spec.base) &&
    position.acceptedContours.includes(spec.contour)
  );
}

export function capacityAt(spec: UldSpec, position: HoldPosition): UldCapacity {
  return {
    volumeM3: spec.volumeM3,
    maxGrossKg: Math.min(spec.maxGrossKg, position.maxWeightKg) - spec.tareKg,
  };
}

export function generateUldSerial(roll: number): string {
  return String(Math.floor(roll * 10 ** SERIAL_LENGTH)).padStart(
    SERIAL_LENGTH,
    '0',
  );
}

export function formatUldCode(
  type: UldType,
  serial: string,
  owner: string,
): string {
  return `${type}${serial}${owner}`;
}
