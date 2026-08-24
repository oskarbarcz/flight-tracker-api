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

export function conflicts(
  one: SpecialHandlingCode[],
  other: SpecialHandlingCode[],
): boolean {
  return SEGREGATION_PAIRS.some(
    ([left, right]) =>
      (one.includes(left) && other.includes(right)) ||
      (one.includes(right) && other.includes(left)),
  );
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
