export enum LimitedBy {
  Weight = 'weight',
  Volume = 'volume',
}

export type UldCapacity = {
  volumeM3: number;
  maxGrossKg: number;
};

export const LD3_CAPACITY: UldCapacity = {
  volumeM3: 4.3,
  maxGrossKg: 1588,
};

export type FillLimit = {
  limitedBy: LimitedBy;
  weightKg: number;
  volumeM3: number;
};

export function volumeOf(weightKg: number, densityKgM3: number): number {
  return weightKg / densityKgM3;
}

export function weightOf(volumeM3: number, densityKgM3: number): number {
  return volumeM3 * densityKgM3;
}

export function breakEvenDensity(capacity: UldCapacity): number {
  return capacity.maxGrossKg / capacity.volumeM3;
}

export function fillLimit(
  densityKgM3: number,
  capacity: UldCapacity,
): FillLimit {
  const weightAtFullVolume = weightOf(capacity.volumeM3, densityKgM3);

  if (weightAtFullVolume < capacity.maxGrossKg) {
    return {
      limitedBy: LimitedBy.Volume,
      weightKg: weightAtFullVolume,
      volumeM3: capacity.volumeM3,
    };
  }

  return {
    limitedBy: LimitedBy.Weight,
    weightKg: capacity.maxGrossKg,
    volumeM3: volumeOf(capacity.maxGrossKg, densityKgM3),
  };
}
