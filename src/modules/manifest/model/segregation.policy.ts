import { HoldCompartment } from './hold-layout.model';
import { Commodity, SpecialHandlingCode } from './commodity.model';

export type SegregationPair = [SpecialHandlingCode, SpecialHandlingCode];

export const SEGREGATION_PAIRS: SegregationPair[] = [
  [SpecialHandlingCode.RadioactiveYellow, SpecialHandlingCode.LiveAnimals],
  [SpecialHandlingCode.RadioactiveWhite, SpecialHandlingCode.LiveAnimals],
  [SpecialHandlingCode.RadioactiveYellow, SpecialHandlingCode.UndevelopedFilm],
  [SpecialHandlingCode.RadioactiveWhite, SpecialHandlingCode.UndevelopedFilm],
  [SpecialHandlingCode.InfectiousSubstance, SpecialHandlingCode.Foodstuffs],
  [SpecialHandlingCode.DryIce, SpecialHandlingCode.LiveAnimals],
  [SpecialHandlingCode.DryIce, SpecialHandlingCode.LiveAnimalsHold],
  [SpecialHandlingCode.Oxidizer, SpecialHandlingCode.FlammableLiquid],
  [SpecialHandlingCode.HumanRemains, SpecialHandlingCode.Foodstuffs],
];

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
