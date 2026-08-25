import {
  bagMassFor,
  BaggageSource,
  DERIVED_BAGS_PER_PASSENGER,
  DOMESTIC_LIMIT_KM,
  HaulTier,
  haulTierOf,
  isPlausibleResidual,
  planBaggage,
  premiumPassengersOf,
  REGIONAL_LIMIT_KM,
  residualKg,
  STANDARD_ADULT_KG,
} from './baggage';

describe('baggage', () => {
  it('reads the haul tier from the sector length', () => {
    expect(haulTierOf(0)).toBe(HaulTier.Domestic);
    expect(haulTierOf(DOMESTIC_LIMIT_KM - 1)).toBe(HaulTier.Domestic);
    expect(haulTierOf(DOMESTIC_LIMIT_KM)).toBe(HaulTier.Regional);
    expect(haulTierOf(REGIONAL_LIMIT_KM)).toBe(HaulTier.Regional);
    expect(haulTierOf(REGIONAL_LIMIT_KM + 1)).toBe(HaulTier.Intercontinental);
  });

  it('uses the standard bag mass of each tier', () => {
    expect(bagMassFor(HaulTier.Domestic)).toBe(15);
    expect(bagMassFor(HaulTier.Regional)).toBe(16);
    expect(bagMassFor(HaulTier.Intercontinental)).toBe(18);
  });

  it('takes the residual as payload less passengers less cargo', () => {
    expect(residualKg(22.507, 200, 3.5)).toBe(2207);
    expect(200 * STANDARD_ADULT_KG).toBe(16800);
  });

  it('reads a residual inside the plausible band as usable', () => {
    expect(isPlausibleResidual(2400, 150)).toBe(true);
    expect(isPlausibleResidual(600, 150)).toBe(true);
    expect(isPlausibleResidual(599, 150)).toBe(false);
    expect(isPlausibleResidual(6000, 150)).toBe(true);
    expect(isPlausibleResidual(6001, 150)).toBe(false);
    expect(isPlausibleResidual(-1600, 335)).toBe(false);
    expect(isPlausibleResidual(2400, 0)).toBe(false);
  });

  it('reconciles baggage against a payload that accounts for it', () => {
    const plan = planBaggage({
      payloadTons: 17.5,
      passengers: 150,
      cargoTons: 2.5,
      distanceKm: 6200,
    });

    expect(plan.source).toBe(BaggageSource.Reconciled);
    expect(plan.weightKg).toBe(2400);
    expect(plan.bagMassKg).toBe(18);
    expect(plan.bagCount).toBe(133);
  });

  it('derives baggage from the passenger count when the payload cannot account for it', () => {
    const plan = planBaggage({
      payloadTons: 34.9,
      passengers: 335,
      cargoTons: 8.4,
      distanceKm: 6200,
    });

    expect(plan.source).toBe(BaggageSource.Derived);
    expect(plan.weightKg).toBe(
      Math.round(335 * DERIVED_BAGS_PER_PASSENGER * 18),
    );
    expect(plan.bagCount).toBeGreaterThan(0);
  });

  it('derives baggage when the residual is implausibly thin', () => {
    const plan = planBaggage({
      payloadTons: 37.9,
      passengers: 348,
      cargoTons: 8,
      distanceKm: 6200,
    });

    expect(plan.source).toBe(BaggageSource.Derived);
  });

  it('carries no baggage for a flight with no passengers', () => {
    const plan = planBaggage({
      payloadTons: 62,
      passengers: 0,
      cargoTons: 62,
      distanceKm: 6200,
    });

    expect(plan.weightKg).toBe(0);
    expect(plan.bagCount).toBe(0);
    expect(plan.priorityBagCount).toBe(0);
  });

  it('counts every cabin that is not economy as premium', () => {
    expect(premiumPassengersOf({ business: 24, economy: 126 })).toBe(24);
    expect(
      premiumPassengersOf({
        first: 8,
        business: 48,
        'premium economy': 32,
        economy: 244,
      }),
    ).toBe(56);
    expect(premiumPassengersOf({ economy: 180 })).toBe(0);
    expect(premiumPassengersOf(null)).toBe(0);
  });

  it('sets aside priority bags in proportion to the premium cabins', () => {
    const plan = planBaggage({
      payloadTons: 17.5,
      passengers: 150,
      cargoTons: 2.5,
      distanceKm: 6200,
      passengersByCabin: { business: 30, economy: 120 },
    });

    expect(plan.priorityBagCount).toBe(Math.round((30 / 150) * plan.bagCount));
    expect(plan.priorityBagCount).toBeGreaterThan(0);
    expect(plan.priorityBagCount).toBeLessThan(plan.bagCount);
  });

  it('sets aside no priority bags without a cabin breakdown', () => {
    const plan = planBaggage({
      payloadTons: 17.5,
      passengers: 150,
      cargoTons: 2.5,
      distanceKm: 6200,
    });

    expect(plan.priorityBagCount).toBe(0);
  });

  it('sets aside no priority bags on a single-class flight', () => {
    const plan = planBaggage({
      payloadTons: 17.5,
      passengers: 150,
      cargoTons: 2.5,
      distanceKm: 6200,
      passengersByCabin: { economy: 150 },
    });

    expect(plan.priorityBagCount).toBe(0);
  });

  it('changes the bag count with the sector length', () => {
    const short = planBaggage({
      payloadTons: 17.5,
      passengers: 150,
      cargoTons: 2.5,
      distanceKm: 800,
    });
    const long = planBaggage({
      payloadTons: 17.5,
      passengers: 150,
      cargoTons: 2.5,
      distanceKm: 6200,
    });

    expect(short.bagMassKg).toBe(15);
    expect(long.bagMassKg).toBe(18);
    expect(short.bagCount).toBeGreaterThan(long.bagCount);
    expect(short.weightKg).toBe(long.weightKg);
  });
});
