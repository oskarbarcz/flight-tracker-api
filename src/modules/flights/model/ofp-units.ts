import { OperationalFlightPlan } from '../../../core/provider/simbrief/type/simbrief.types';

export enum OfpMassUnit {
  Kilograms = 'kgs',
  Pounds = 'lbs',
}

const KILOGRAMS_PER_POUND = 0.45359237;

export function readOfpMassUnit(ofp: OperationalFlightPlan): OfpMassUnit {
  return ofp.params?.units === OfpMassUnit.Pounds
    ? OfpMassUnit.Pounds
    : OfpMassUnit.Kilograms;
}

export function toKilograms(value: number, unit: OfpMassUnit): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return unit === OfpMassUnit.Pounds
    ? Math.round(value * KILOGRAMS_PER_POUND)
    : Math.round(value);
}

export function toTons(value: number, unit: OfpMassUnit): number {
  return toKilograms(value, unit) / 1000;
}
