import {
  expandCompartment,
  expandPositions,
  PositionOrdinals,
  SourceCompartment,
} from './hold-position-expander';
import {
  CargoDoorSide,
  CompartmentLoading,
  HoldCompartmentName,
  HoldPositionSide,
} from './hold-layout.model';
import { UldBaseCode, UldContourCode } from './uld-code.model';

function compartment(
  overrides: Partial<SourceCompartment> = {},
): SourceCompartment {
  return {
    number: 1,
    name: HoldCompartmentName.Forward,
    loading: CompartmentLoading.Uld,
    maxWeightKg: 6352,
    volumeM3: 17.2,
    heated: false,
    ventilated: false,
    doorSide: CargoDoorSide.Right,
    positionTemplate: {
      ordinals: PositionOrdinals.Numeric,
      rows: 2,
      sides: [HoldPositionSide.Left, HoldPositionSide.Right],
      acceptedBases: [UldBaseCode.Ld3],
      acceptedContours: [
        UldContourCode.Ld3FullHeight,
        UldContourCode.Ld3ReducedHeight,
      ],
      maxWeightKg: 1588,
    },
    ...overrides,
  };
}

describe('hold position expander', () => {
  it('designates a paired run by compartment, ordinal and side', () => {
    const positions = expandPositions(compartment());

    expect(positions.map((position) => position.designator)).toEqual([
      '11L',
      '11R',
      '12L',
      '12R',
    ]);
  });

  it('designates a full-width run with a pallet suffix', () => {
    const positions = expandPositions(
      compartment({
        number: 4,
        positionTemplate: {
          ordinals: PositionOrdinals.Numeric,
          rows: 3,
          sides: [HoldPositionSide.Full],
          acceptedBases: [UldBaseCode.Pallet96],
          acceptedContours: [UldContourCode.Pallet96Contoured],
          maxWeightKg: 6800,
        },
      }),
    );

    expect(positions.map((position) => position.designator)).toEqual([
      '41P',
      '42P',
      '43P',
    ]);
  });

  it('designates a main deck run by letter', () => {
    const positions = expandPositions(
      compartment({
        number: 6,
        name: HoldCompartmentName.Main,
        positionTemplate: {
          ordinals: PositionOrdinals.Alpha,
          rows: 3,
          sides: [HoldPositionSide.Left, HoldPositionSide.Right],
          acceptedBases: [UldBaseCode.Pallet96],
          acceptedContours: [UldContourCode.MainDeckContainer],
          maxWeightKg: 6804,
        },
      }),
    );

    expect(positions.map((position) => position.designator)).toEqual([
      'AL',
      'AR',
      'BL',
      'BR',
      'CL',
      'CR',
    ]);
  });

  it('carries the template onto every position', () => {
    const positions = expandPositions(compartment());

    expect(positions.every((position) => position.compartment === 1)).toBe(
      true,
    );
    expect(positions.every((position) => position.maxWeightKg === 1588)).toBe(
      true,
    );
    expect(positions[0].acceptedContours).toEqual([
      UldContourCode.Ld3FullHeight,
      UldContourCode.Ld3ReducedHeight,
    ]);
  });

  it('replaces only the fields an override names', () => {
    const positions = expandPositions(
      compartment({
        positionOverrides: [
          {
            designator: '12R',
            acceptedContours: [UldContourCode.Ld3ReducedHeight],
          },
        ],
      }),
    );

    const overridden = positions.find(
      (position) => position.designator === '12R',
    )!;
    const untouched = positions.find(
      (position) => position.designator === '12L',
    )!;

    expect(overridden.acceptedContours).toEqual([
      UldContourCode.Ld3ReducedHeight,
    ]);
    expect(overridden.maxWeightKg).toBe(1588);
    expect(overridden.acceptedBases).toEqual([UldBaseCode.Ld3]);
    expect(untouched.acceptedContours).toEqual([
      UldContourCode.Ld3FullHeight,
      UldContourCode.Ld3ReducedHeight,
    ]);
  });

  it('expands a compartment with no template to no positions', () => {
    const loose = compartment({
      loading: CompartmentLoading.Loose,
      positionTemplate: undefined,
    });

    expect(expandPositions(loose)).toEqual([]);
    expect(expandCompartment(loose).positions).toEqual([]);
  });

  it('keeps the fields of the compartment it expands', () => {
    const expanded = expandCompartment(
      compartment({ heated: true, ventilated: true, volumeM3: 12.4 }),
    );

    expect(expanded.heated).toBe(true);
    expect(expanded.ventilated).toBe(true);
    expect(expanded.volumeM3).toBe(12.4);
    expect(expanded.positions).toHaveLength(4);
  });
});
