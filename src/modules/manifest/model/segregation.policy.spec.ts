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
import { COMMODITIES } from '../data/cargo-commodities';
import { FOODSTUFF_CODES, LIVE_ANIMAL_CODES } from './segregation.policy';

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

describe('segregation against the real catalogue', () => {
  const shcOf = (id: string): SpecialHandlingCode[] =>
    findCommodityById(id)!.shc;

  it('keeps an infectious substance away from every food commodity', () => {
    const foods = COMMODITIES.filter((commodity) =>
      commodity.shc.some((code) => FOODSTUFF_CODES.includes(code)),
    );
    const allowed = foods.filter(
      (food) => !conflicts(shcOf('infectious-cat-a'), food.shc),
    );

    expect(foods.length).toBeGreaterThan(10);
    expect(allowed.map((food) => food.id)).toEqual([]);
  });

  it('keeps human remains away from every food commodity', () => {
    const foods = COMMODITIES.filter((commodity) =>
      commodity.shc.some((code) => FOODSTUFF_CODES.includes(code)),
    );
    const allowed = foods.filter(
      (food) => !conflicts(shcOf('human-remains'), food.shc),
    );

    expect(allowed.map((food) => food.id)).toEqual([]);
  });

  it('keeps radioactive material away from every live animal commodity', () => {
    const animals = COMMODITIES.filter((commodity) =>
      commodity.shc.some((code) => LIVE_ANIMAL_CODES.includes(code)),
    );
    const allowed = animals.filter(
      (animal) => !conflicts(shcOf('radiopharmaceuticals'), animal.shc),
    );

    expect(animals.length).toBeGreaterThan(3);
    expect(allowed.map((animal) => animal.id)).toEqual([]);
  });

  it('keeps dry ice away from every live animal commodity', () => {
    const animals = COMMODITIES.filter((commodity) =>
      commodity.shc.some((code) => LIVE_ANIMAL_CODES.includes(code)),
    );
    const allowed = animals.filter(
      (animal) => !conflicts(shcOf('dry-ice'), animal.shc),
    );

    expect(allowed.map((animal) => animal.id)).toEqual([]);
  });

  it('leaves unrelated freight free to share a compartment', () => {
    expect(conflicts(shcOf('printed-matter'), shcOf('coffee-beans'))).toBe(
      false,
    );
  });
});
