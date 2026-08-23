import { compartmentsOf, HoldVariant } from './hold-layout.model';

export const MAX_PLAUSIBLE_DENSITY_KG_M3 = 2000;

export type HoldCapacity = {
  weightKg: number;
  volumeM3: number;
};

export function capacityOf(variant: HoldVariant): HoldCapacity {
  const compartments = compartmentsOf(variant);

  return {
    weightKg: compartments.reduce(
      (sum, compartment) => sum + compartment.maxWeightKg,
      0,
    ),
    volumeM3: Math.round(
      compartments.reduce((sum, compartment) => sum + compartment.volumeM3, 0),
    ),
  };
}

export function maxWeightByVolume(capacity: HoldCapacity): number {
  return Math.round(capacity.volumeM3 * MAX_PLAUSIBLE_DENSITY_KG_M3);
}
