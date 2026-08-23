import {
  breakEvenDensity,
  fillLimit,
  LD3_CAPACITY,
  LimitedBy,
  volumeOf,
  weightOf,
} from './cargo-volume';

describe('cargo volume', () => {
  it('derives volume from weight and density', () => {
    expect(volumeOf(1000, 250)).toBe(4);
    expect(weightOf(4, 250)).toBe(1000);
  });

  it('puts the break-even density of an LD3 at about 369 kilograms per cubic metre', () => {
    expect(breakEvenDensity(LD3_CAPACITY)).toBeCloseTo(369.3, 1);
  });

  it('cubes out below the break-even density', () => {
    const flowers = fillLimit(120, LD3_CAPACITY);

    expect(flowers.limitedBy).toBe(LimitedBy.Volume);
    expect(flowers.volumeM3).toBe(LD3_CAPACITY.volumeM3);
    expect(Math.round(flowers.weightKg)).toBe(516);
    expect(flowers.weightKg).toBeLessThan(LD3_CAPACITY.maxGrossKg);
  });

  it('weighs out above the break-even density', () => {
    const batteries = fillLimit(900, LD3_CAPACITY);

    expect(batteries.limitedBy).toBe(LimitedBy.Weight);
    expect(batteries.weightKg).toBe(LD3_CAPACITY.maxGrossKg);
    expect(batteries.volumeM3).toBeCloseTo(1.76, 2);
    expect(batteries.volumeM3).toBeLessThan(LD3_CAPACITY.volumeM3);
  });

  it('reaches both limits together at the break-even density', () => {
    const balanced = fillLimit(breakEvenDensity(LD3_CAPACITY), LD3_CAPACITY);

    expect(balanced.weightKg).toBeCloseTo(LD3_CAPACITY.maxGrossKg, 6);
    expect(balanced.volumeM3).toBeCloseTo(LD3_CAPACITY.volumeM3, 6);
  });

  it('needs three times as many containers for flowers as for batteries', () => {
    const perContainer = (density: number): number =>
      fillLimit(density, LD3_CAPACITY).weightKg;

    const flowerContainers = Math.ceil(3500 / perContainer(120));
    const batteryContainers = Math.ceil(3500 / perContainer(900));

    expect(flowerContainers).toBe(7);
    expect(batteryContainers).toBe(3);
  });
});
