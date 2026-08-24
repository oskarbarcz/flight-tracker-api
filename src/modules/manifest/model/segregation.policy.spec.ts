import {
  compartmentAccepts,
  conflicts,
  dryIceKgOf,
  mayJoinCompartment,
  SEGREGATION_PAIRS,
} from './segregation.policy';
import { SpecialHandlingCode } from './commodity.model';
import { findCommodityById } from '../data/cargo-commodities';
import { findHoldLayoutByType } from '../data/cargo-holds';
import { compartmentsOf, defaultVariantOf } from './hold-layout.model';

const heatedAndVentilated = compartmentsOf(
  defaultVariantOf(findHoldLayoutByType('B77W')!),
).find((compartment) => compartment.heated && compartment.ventilated)!;

const plain = compartmentsOf(
  defaultVariantOf(findHoldLayoutByType('B738')!),
).find((compartment) => !compartment.heated && !compartment.ventilated)!;

describe('segregation policy', () => {
  it('keeps every declared pair apart in both orders', () => {
    const failures = SEGREGATION_PAIRS.flatMap(([one, other]) => {
      const forward = conflicts([one], [other]);
      const backward = conflicts([other], [one]);

      return forward && backward ? [] : [`${one}/${other}`];
    });

    expect(failures).toEqual([]);
  });

  it('keeps radioactive material from live animals and undeveloped film', () => {
    expect(
      conflicts(
        [SpecialHandlingCode.RadioactiveYellow],
        [SpecialHandlingCode.LiveAnimals],
      ),
    ).toBe(true);
    expect(
      conflicts(
        [SpecialHandlingCode.UndevelopedFilm],
        [SpecialHandlingCode.RadioactiveWhite],
      ),
    ).toBe(true);
  });

  it('keeps infectious substances from foodstuffs', () => {
    expect(
      conflicts(
        [SpecialHandlingCode.Foodstuffs],
        [SpecialHandlingCode.InfectiousSubstance],
      ),
    ).toBe(true);
  });

  it('keeps dry ice from live animals', () => {
    expect(
      conflicts(
        [SpecialHandlingCode.DryIce],
        [SpecialHandlingCode.LiveAnimals],
      ),
    ).toBe(true);
    expect(
      conflicts(
        [SpecialHandlingCode.LiveAnimalsHold],
        [SpecialHandlingCode.DryIce],
      ),
    ).toBe(true);
  });

  it('keeps oxidizers from flammable liquids', () => {
    expect(
      conflicts(
        [SpecialHandlingCode.Oxidizer],
        [SpecialHandlingCode.FlammableLiquid],
      ),
    ).toBe(true);
  });

  it('keeps human remains from foodstuffs', () => {
    expect(
      conflicts(
        [SpecialHandlingCode.HumanRemains],
        [SpecialHandlingCode.Foodstuffs],
      ),
    ).toBe(true);
  });

  it('allows load that shares no declared pair', () => {
    expect(
      conflicts(
        [SpecialHandlingCode.Perishable, SpecialHandlingCode.PerishableFlowers],
        [SpecialHandlingCode.Express],
      ),
    ).toBe(false);
    expect(conflicts([], [SpecialHandlingCode.DryIce])).toBe(false);
  });

  it('refuses to add conflicting load to a compartment', () => {
    expect(
      mayJoinCompartment(
        [SpecialHandlingCode.DryIce],
        [SpecialHandlingCode.LiveAnimals, SpecialHandlingCode.Perishable],
      ),
    ).toBe(false);
    expect(
      mayJoinCompartment(
        [SpecialHandlingCode.Express],
        [SpecialHandlingCode.LiveAnimals],
      ),
    ).toBe(true);
  });

  it('places live animals only in a heated and ventilated compartment', () => {
    const chicks = findCommodityById('day-old-chicks')!;

    expect(compartmentAccepts(chicks, heatedAndVentilated)).toBe(true);
    expect(compartmentAccepts(chicks, plain)).toBe(false);
  });

  it('places ordinary load in any compartment', () => {
    const parts = findCommodityById('auto-parts')!;

    expect(compartmentAccepts(parts, heatedAndVentilated)).toBe(true);
    expect(compartmentAccepts(parts, plain)).toBe(true);
  });

  it('counts dry ice weight only where dry ice is carried', () => {
    expect(dryIceKgOf([SpecialHandlingCode.DryIce], 132)).toBe(132);
    expect(dryIceKgOf([SpecialHandlingCode.Perishable], 132)).toBe(0);
  });
});
