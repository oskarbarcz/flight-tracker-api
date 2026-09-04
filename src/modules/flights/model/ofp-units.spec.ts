import { OperationalFlightPlan } from '../../../core/provider/simbrief/type/simbrief.types';
import { OfpMassUnit, readOfpMassUnit, toKilograms, toTons } from './ofp-units';

function plan(units?: string): OperationalFlightPlan {
  return { params: { units } } as OperationalFlightPlan;
}

describe('readOfpMassUnit', () => {
  it('reads the pounds a plan is generated in', () => {
    expect(readOfpMassUnit(plan('lbs'))).toBe(OfpMassUnit.Pounds);
  });

  it('reads the kilograms a plan is generated in', () => {
    expect(readOfpMassUnit(plan('kgs'))).toBe(OfpMassUnit.Kilograms);
  });

  it('reads a plan stating no unit as kilograms', () => {
    expect(readOfpMassUnit(plan())).toBe(OfpMassUnit.Kilograms);
  });

  it('reads a unit it does not know as kilograms', () => {
    expect(readOfpMassUnit(plan('stones'))).toBe(OfpMassUnit.Kilograms);
  });

  it('reads a plan carrying no parameters at all as kilograms', () => {
    expect(readOfpMassUnit({} as OperationalFlightPlan)).toBe(
      OfpMassUnit.Kilograms,
    );
  });
});

describe('toKilograms', () => {
  it('leaves a mass already published in kilograms', () => {
    expect(toKilograms(71636, OfpMassUnit.Kilograms)).toBe(71636);
  });

  it('converts a mass published in pounds', () => {
    expect(toKilograms(157928, OfpMassUnit.Pounds)).toBe(71635);
  });

  it('rounds a converted mass to the whole kilogram', () => {
    expect(toKilograms(1, OfpMassUnit.Pounds)).toBe(0);
    expect(toKilograms(3, OfpMassUnit.Pounds)).toBe(1);
  });

  it('reads a mass the plan does not state as zero', () => {
    expect(toKilograms(Number('nonsense'), OfpMassUnit.Pounds)).toBe(0);
  });
});

describe('toTons', () => {
  it('converts a mass published in pounds', () => {
    expect(toTons(157928, OfpMassUnit.Pounds)).toBe(71.635);
  });

  it('leaves a mass already published in kilograms', () => {
    expect(toTons(71636, OfpMassUnit.Kilograms)).toBe(71.636);
  });
});
