export enum HaulTier {
  Domestic = 'domestic',
  Regional = 'regional',
  Intercontinental = 'intercontinental',
}

export enum BaggageSource {
  Reconciled = 'reconciled',
  Derived = 'derived',
}

export const STANDARD_ADULT_KG = 84;
export const DOMESTIC_LIMIT_KM = 1000;
export const REGIONAL_LIMIT_KM = 4000;
export const DERIVED_BAGS_PER_PASSENGER = 0.7;
export const MIN_PLAUSIBLE_BAGGAGE_PER_PASSENGER_KG = 4;
export const MAX_PLAUSIBLE_BAGGAGE_PER_PASSENGER_KG = 40;

const BAG_MASS_KG: Record<HaulTier, number> = {
  [HaulTier.Domestic]: 15,
  [HaulTier.Regional]: 16,
  [HaulTier.Intercontinental]: 18,
};

export type BaggagePlan = {
  source: BaggageSource;
  weightKg: number;
  bagCount: number;
  bagMassKg: number;
  priorityBagCount: number;
};

export function haulTierOf(distanceKm: number): HaulTier {
  if (distanceKm < DOMESTIC_LIMIT_KM) {
    return HaulTier.Domestic;
  }

  return distanceKm <= REGIONAL_LIMIT_KM
    ? HaulTier.Regional
    : HaulTier.Intercontinental;
}

export function bagMassFor(tier: HaulTier): number {
  return BAG_MASS_KG[tier];
}

export function residualKg(
  payloadTons: number,
  passengers: number,
  cargoTons: number,
): number {
  return Math.round(
    payloadTons * 1000 - passengers * STANDARD_ADULT_KG - cargoTons * 1000,
  );
}

export function isPlausibleResidual(
  residual: number,
  passengers: number,
): boolean {
  if (passengers === 0) {
    return false;
  }

  const perPassenger = residual / passengers;

  return (
    perPassenger >= MIN_PLAUSIBLE_BAGGAGE_PER_PASSENGER_KG &&
    perPassenger <= MAX_PLAUSIBLE_BAGGAGE_PER_PASSENGER_KG
  );
}

export function premiumPassengersOf(
  passengersByCabin: Record<string, number> | null | undefined,
): number {
  if (!passengersByCabin) {
    return 0;
  }

  return Object.entries(passengersByCabin)
    .filter(([cabin]) => !isEconomy(cabin))
    .reduce((sum, [, count]) => sum + count, 0);
}

export function planBaggage(input: {
  payloadTons: number;
  passengers: number;
  cargoTons: number;
  distanceKm: number;
  passengersByCabin?: Record<string, number> | null;
}): BaggagePlan {
  const { payloadTons, passengers, cargoTons, distanceKm } = input;
  const bagMassKg = bagMassFor(haulTierOf(distanceKm));

  if (passengers === 0) {
    return {
      source: BaggageSource.Derived,
      weightKg: 0,
      bagCount: 0,
      bagMassKg,
      priorityBagCount: 0,
    };
  }

  const residual = residualKg(payloadTons, passengers, cargoTons);
  const reconciled = isPlausibleResidual(residual, passengers);
  const weightKg = reconciled
    ? residual
    : Math.round(passengers * DERIVED_BAGS_PER_PASSENGER * bagMassKg);
  const bagCount = Math.max(1, Math.round(weightKg / bagMassKg));
  const premium = premiumPassengersOf(input.passengersByCabin);

  return {
    source: reconciled ? BaggageSource.Reconciled : BaggageSource.Derived,
    weightKg,
    bagCount,
    bagMassKg,
    priorityBagCount: Math.round((premium / passengers) * bagCount),
  };
}

function isEconomy(cabin: string): boolean {
  return /econom/i.test(cabin);
}
