import {
  capacityAt,
  fits,
  formatUldCode,
  generateUldSerial,
  ULD_SPECS,
  uldSpecsFor,
  UldType,
} from './uld';
import { HoldPosition, HoldPositionSide } from './hold-layout.model';
import { UldBaseCode, UldContourCode } from './uld-code.model';
import { findHoldLayoutByType } from '../data/cargo-holds';
import { positionsOf } from './hold-layout.model';

const ld3Position: HoldPosition = {
  designator: '11L',
  compartment: 1,
  side: HoldPositionSide.Left,
  acceptedBases: [UldBaseCode.Ld3],
  acceptedContours: [
    UldContourCode.Ld3FullHeight,
    UldContourCode.Ld3ReducedHeight,
    UldContourCode.Ld3Active,
  ],
  maxWeightKg: 1588,
};

const reducedPosition: HoldPosition = {
  ...ld3Position,
  designator: '11P',
  side: HoldPositionSide.Full,
  acceptedContours: [UldContourCode.Ld3ReducedHeight],
  maxWeightKg: 1134,
};

describe('unit load devices', () => {
  it('describes every type with a tare, a weight limit and a volume', () => {
    const wrong = Object.values(ULD_SPECS).filter(
      (spec) =>
        spec.tareKg <= 0 ||
        spec.maxGrossKg <= spec.tareKg ||
        spec.volumeM3 <= 0,
    );

    expect(wrong).toEqual([]);
  });

  it('keys every spec by its own type code', () => {
    const wrong = Object.entries(ULD_SPECS).filter(
      ([key, spec]) => key !== spec.type,
    );

    expect(wrong).toEqual([]);
  });

  it('offers the three LD3 devices for a full-height LD3 position', () => {
    expect(
      uldSpecsFor(ld3Position)
        .map((spec) => spec.type)
        .sort(),
    ).toEqual([UldType.Ld3, UldType.Ld3Reduced, UldType.Ld3Active]);
  });

  it('offers only the reduced device for a reduced-height position', () => {
    expect(uldSpecsFor(reducedPosition).map((spec) => spec.type)).toEqual([
      UldType.Ld3Reduced,
    ]);
  });

  it('refuses a device the position does not accept', () => {
    expect(fits(ULD_SPECS[UldType.Ld3], reducedPosition)).toBe(false);
    expect(fits(ULD_SPECS[UldType.Pallet96], ld3Position)).toBe(false);
    expect(fits(ULD_SPECS[UldType.Ld3Reduced], reducedPosition)).toBe(true);
  });

  it('takes the payload capacity net of tare', () => {
    const capacity = capacityAt(ULD_SPECS[UldType.Ld3], ld3Position);

    expect(capacity.maxGrossKg).toBe(1588 - 82);
    expect(capacity.volumeM3).toBe(4.3);
  });

  it('lets the position limit bind when it is lower than the device limit', () => {
    const capacity = capacityAt(ULD_SPECS[UldType.Ld3Reduced], reducedPosition);

    expect(capacity.maxGrossKg).toBe(1134 - 75);
  });

  it('generates a five-digit serial for every roll', () => {
    const malformed = Array.from({ length: 200 }, (_, index) => index / 200)
      .map(generateUldSerial)
      .filter((serial) => !/^\d{5}$/.test(serial));

    expect(malformed).toEqual([]);
  });

  it('formats a device code as type, serial and owner', () => {
    expect(formatUldCode(UldType.Ld3, '40218', 'LH')).toBe('AKE40218LH');
  });

  it('finds a device for every position of every curated variant', () => {
    const layouts = ['B77W', 'A320', 'A321', 'A319', 'B77F', 'B74F', 'B48F'];
    const orphans = layouts.flatMap((type) =>
      findHoldLayoutByType(type)!.variants.flatMap((variant) =>
        positionsOf(variant)
          .filter((position) => uldSpecsFor(position).length === 0)
          .map((position) => `${variant.id}/${position.designator}`),
      ),
    );

    expect(orphans).toEqual([]);
  });
});
