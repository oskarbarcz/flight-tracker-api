import { HoldCompartment } from './hold-layout.model';
import { Commodity, SpecialHandlingCode } from './commodity.model';

export type SegregationPair = [SpecialHandlingCode, SpecialHandlingCode];

export const FOODSTUFF_CODES: SpecialHandlingCode[] = [
  SpecialHandlingCode.Foodstuffs,
  SpecialHandlingCode.PerishableMeat,
  SpecialHandlingCode.PerishableSeafood,
  SpecialHandlingCode.PerishableProduce,
];

export const LIVE_ANIMAL_CODES: SpecialHandlingCode[] = [
  SpecialHandlingCode.LiveAnimals,
  SpecialHandlingCode.LiveAnimalsHold,
  SpecialHandlingCode.HatchingEggs,
];

export const RADIOACTIVE_CODES: SpecialHandlingCode[] = [
  SpecialHandlingCode.RadioactiveWhite,
  SpecialHandlingCode.RadioactiveYellow,
];

const SEGREGATION_RULES: [SpecialHandlingCode[], SpecialHandlingCode[]][] = [
  [RADIOACTIVE_CODES, LIVE_ANIMAL_CODES],
  [RADIOACTIVE_CODES, [SpecialHandlingCode.UndevelopedFilm]],
  [[SpecialHandlingCode.InfectiousSubstance], FOODSTUFF_CODES],
  [[SpecialHandlingCode.DryIce], LIVE_ANIMAL_CODES],
  [[SpecialHandlingCode.Oxidizer], [SpecialHandlingCode.FlammableLiquid]],
  [[SpecialHandlingCode.HumanRemains], FOODSTUFF_CODES],
];

export const SEGREGATION_PAIRS: SegregationPair[] = SEGREGATION_RULES.flatMap(
  ([left, right]) =>
    left.flatMap((one) => right.map((other): SegregationPair => [one, other])),
);

export function conflictingPairs(
  one: SpecialHandlingCode[],
  other: SpecialHandlingCode[],
): SegregationPair[] {
  const found = new Map<string, SegregationPair>();

  for (const [left, right] of SEGREGATION_PAIRS) {
    if (one.includes(left) && other.includes(right)) {
      remember(found, left, right);
    }

    if (one.includes(right) && other.includes(left)) {
      remember(found, right, left);
    }
  }

  return [...found.values()];
}

export function conflictingPairsWithin(
  codes: SpecialHandlingCode[],
): SegregationPair[] {
  const carried = [...new Set(codes)];
  const found = new Map<string, SegregationPair>();

  for (const [left, right] of SEGREGATION_PAIRS) {
    if (left !== right && carried.includes(left) && carried.includes(right)) {
      remember(found, left, right);
    }
  }

  return [...found.values()];
}

function remember(
  found: Map<string, SegregationPair>,
  one: SpecialHandlingCode,
  other: SpecialHandlingCode,
): void {
  const key = [one, other].sort().join('|');

  if (!found.has(key)) {
    found.set(key, [one, other]);
  }
}

export function conflicts(
  one: SpecialHandlingCode[],
  other: SpecialHandlingCode[],
): boolean {
  return conflictingPairs(one, other).length > 0;
}

export function mayJoinCompartment(
  candidate: SpecialHandlingCode[],
  alreadyLoaded: SpecialHandlingCode[],
): boolean {
  return !conflicts(candidate, alreadyLoaded);
}

export function compartmentAccepts(
  commodity: Commodity,
  compartment: HoldCompartment,
): boolean {
  if (commodity.compartment.requiresHeated && !compartment.heated) {
    return false;
  }

  return !(commodity.compartment.requiresVentilated && !compartment.ventilated);
}

export function dryIceKgOf(
  shc: SpecialHandlingCode[],
  grossKg: number,
): number {
  return shc.includes(SpecialHandlingCode.DryIce) ? grossKg : 0;
}
