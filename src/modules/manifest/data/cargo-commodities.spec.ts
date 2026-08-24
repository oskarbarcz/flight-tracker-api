import {
  COMMODITIES,
  dangerousCommodities,
  findCommodityById,
} from './cargo-commodities';
import {
  DRILL_LETTERS,
  drillLettersOf,
  drillNumberForHazardClass,
  drillNumberOf,
  ERC_PATTERN,
  HazardClass,
  OffloadPriority,
  PackingGroup,
  SPECIAL_HANDLING_CODES,
  SpecialHandlingCode,
  TemperatureRegime,
  TemperatureSolution,
} from '../model/commodity.model';
import { Continent } from '../../airports/model/airport.model';
import { isGeneric } from '../model/commodity-selection';

const MIN_DENSITY = 30;
const MAX_DENSITY = 2000;
const TEMPERATURE_CODES = [
  SpecialHandlingCode.Perishable,
  SpecialHandlingCode.Pharmaceuticals,
  SpecialHandlingCode.Cool,
  SpecialHandlingCode.ControlledRoomTemperature,
  SpecialHandlingCode.Frozen,
  SpecialHandlingCode.ActiveTemperatureControl,
  SpecialHandlingCode.Foodstuffs,
  SpecialHandlingCode.LiveAnimals,
  SpecialHandlingCode.LivingOrgans,
];

const idsOf = (
  predicate: (commodity: (typeof COMMODITIES)[number]) => boolean,
) => COMMODITIES.filter(predicate).map((commodity) => commodity.id);

describe('cargo commodities dataset', () => {
  it('holds exactly one hundred commodities', () => {
    expect(COMMODITIES).toHaveLength(100);
  });

  it('gives every commodity a unique identifier', () => {
    const ids = COMMODITIES.map((commodity) => commodity.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it('names and describes every commodity', () => {
    expect(
      idsOf(
        (commodity) =>
          commodity.name.trim().length === 0 ||
          commodity.descriptions.length === 0 ||
          commodity.descriptions.some(
            (description) => description.trim().length === 0,
          ),
      ),
    ).toEqual([]);
  });

  it('states a plausible density for every commodity', () => {
    expect(
      idsOf(
        (commodity) =>
          commodity.densityKgM3 < MIN_DENSITY ||
          commodity.densityKgM3 > MAX_DENSITY,
      ),
    ).toEqual([]);
  });

  it('states a coherent piece profile for every commodity', () => {
    expect(
      idsOf(
        (commodity) =>
          commodity.piece.minKg <= 0 ||
          commodity.piece.maxKg < commodity.piece.minKg ||
          commodity.piece.packaging.trim().length === 0 ||
          commodity.minPieces < 1 ||
          commodity.maxPieces < commodity.minPieces,
      ),
    ).toEqual([]);
  });

  it('uses only recognised special handling codes', () => {
    expect(
      idsOf((commodity) =>
        commodity.shc.some((code) => !SPECIAL_HANDLING_CODES.includes(code)),
      ),
    ).toEqual([]);
  });

  it('states at least one month and only real months', () => {
    expect(
      idsOf(
        (commodity) =>
          commodity.months.length === 0 ||
          commodity.months.some((month) => month < 1 || month > 12),
      ),
    ).toEqual([]);
  });

  it('keeps peak months within the months a commodity moves in', () => {
    expect(
      idsOf((commodity) =>
        commodity.peakMonths.some((month) => !commodity.months.includes(month)),
      ),
    ).toEqual([]);
  });

  it('states an offload priority in range for every commodity', () => {
    const priorities = Object.values(OffloadPriority).filter(
      (value) => typeof value === 'number',
    );

    expect(
      idsOf((commodity) => !priorities.includes(commodity.offloadPriority)),
    ).toEqual([]);
  });

  it('reserves the highest offload priority for load that must not be shed', () => {
    const never = idsOf(
      (commodity) => commodity.offloadPriority === OffloadPriority.Never,
    );

    expect(never.sort()).toEqual([
      'engine-fan-blades',
      'landing-gear',
      'living-organs',
      'satellite-components',
    ]);
  });

  it('states a positive frequency and a demand for every commodity', () => {
    const continents: string[] = Object.values(Continent);

    expect(
      idsOf(
        (commodity) =>
          commodity.frequency < 1 ||
          commodity.demand.length === 0 ||
          commodity.demand.some((continent) => !continents.includes(continent)),
      ),
    ).toEqual([]);
  });

  it('names a source tier or is declared available from anywhere', () => {
    expect(
      idsOf(
        (commodity) =>
          !isGeneric(commodity) &&
          commodity.sources.airports.length === 0 &&
          commodity.sources.countries.length === 0 &&
          commodity.sources.continents.length === 0,
      ),
    ).toEqual([]);
  });

  it('keeps the commodities available from anywhere to a handful', () => {
    const generic = idsOf(isGeneric);

    expect(generic.length).toBeGreaterThan(0);
    expect(generic.length).toBeLessThanOrEqual(15);
  });

  it('names only real continents as sources', () => {
    const continents: string[] = Object.values(Continent);

    expect(
      idsOf((commodity) =>
        commodity.sources.continents.some(
          (continent) => !continents.includes(continent),
        ),
      ),
    ).toEqual([]);
  });

  it('names source airports as three-letter IATA codes', () => {
    expect(
      idsOf((commodity) =>
        commodity.sources.airports.some((code) => !/^[A-Z]{3}$/.test(code)),
      ),
    ).toEqual([]);
  });

  it('carries roughly thirty dangerous goods entries', () => {
    const dangerous = dangerousCommodities();

    expect(dangerous.length).toBeGreaterThanOrEqual(28);
    expect(dangerous.length).toBeLessThanOrEqual(32);
  });

  it('declares every dangerous goods entry in full', () => {
    const hazardClasses: string[] = Object.values(HazardClass);
    const packingGroups: string[] = Object.values(PackingGroup);

    const wrong = dangerousCommodities()
      .filter((commodity) => {
        const dg = commodity.dangerousGoods!;

        return (
          !/^\d{4}$/.test(dg.unNumber) ||
          dg.properShippingName.trim().length === 0 ||
          !hazardClasses.includes(dg.hazardClass) ||
          (dg.subsidiaryRisk !== null &&
            !hazardClasses.includes(dg.subsidiaryRisk)) ||
          (dg.packingGroup !== null &&
            !packingGroups.includes(dg.packingGroup)) ||
          dg.netPerPackage.trim().length === 0
        );
      })
      .map((commodity) => commodity.id);

    expect(wrong).toEqual([]);
  });

  it('shapes every emergency response code as a drill number and letters', () => {
    const wrong = dangerousCommodities()
      .filter(
        (commodity) => !ERC_PATTERN.test(commodity.dangerousGoods!.ercCode),
      )
      .map((commodity) => commodity.id);

    expect(wrong).toEqual([]);
  });

  it('derives every drill number from the hazard class', () => {
    const wrong = dangerousCommodities()
      .filter((commodity) => {
        const dg = commodity.dangerousGoods!;

        return (
          drillNumberOf(dg.ercCode) !==
          drillNumberForHazardClass(dg.hazardClass)
        );
      })
      .map(
        (commodity) => `${commodity.id}/${commodity.dangerousGoods!.ercCode}`,
      );

    expect(wrong).toEqual([]);
  });

  it('uses only drill letters the chart defines', () => {
    const wrong = dangerousCommodities()
      .filter((commodity) =>
        drillLettersOf(commodity.dangerousGoods!.ercCode).some(
          (letter) => !DRILL_LETTERS.includes(letter),
        ),
      )
      .map((commodity) => commodity.id);

    expect(wrong).toEqual([]);
  });

  it('never states a road transport guide number as an emergency response code', () => {
    const wrong = dangerousCommodities()
      .filter((commodity) => /^\d+$/.test(commodity.dangerousGoods!.ercCode))
      .map((commodity) => commodity.id);

    expect(wrong).toEqual([]);
  });

  it('explains every emergency response code that rests on judgement', () => {
    const judged = dangerousCommodities().filter(
      (commodity) => commodity.dangerousGoods!.sourceNote,
    );

    expect(judged.length).toBeGreaterThan(0);
    expect(
      judged.every(
        (commodity) => commodity.dangerousGoods!.sourceNote!.trim().length > 20,
      ),
    ).toBe(true);
  });

  it('codes every cargo-aircraft-only entry as such on both sides', () => {
    const wrong = COMMODITIES.filter((commodity) => {
      const coded = commodity.shc.includes(
        SpecialHandlingCode.CargoAircraftOnly,
      );
      const declared = commodity.dangerousGoods?.cargoAircraftOnly === true;

      return coded !== declared;
    }).map((commodity) => commodity.id);

    expect(wrong).toEqual([]);
  });

  it('carries at least one cargo-aircraft-only commodity', () => {
    expect(
      idsOf((commodity) =>
        commodity.shc.includes(SpecialHandlingCode.CargoAircraftOnly),
      ).length,
    ).toBeGreaterThan(0);
  });

  it('states a coherent temperature profile wherever one is given', () => {
    const regimes: string[] = Object.values(TemperatureRegime);
    const solutions: string[] = Object.values(TemperatureSolution);

    expect(
      idsOf((commodity) => {
        const profile = commodity.temperature;

        if (!profile) {
          return false;
        }

        return (
          !regimes.includes(profile.regime) ||
          !solutions.includes(profile.solution) ||
          profile.minC >= profile.maxC ||
          profile.enduranceHours <= 0
        );
      }),
    ).toEqual([]);
  });

  it('gives every temperature-controlled commodity a handling code that says so', () => {
    expect(
      idsOf(
        (commodity) =>
          commodity.temperature !== undefined &&
          !commodity.shc.some((code) => TEMPERATURE_CODES.includes(code)),
      ),
    ).toEqual([]);
  });

  it('codes an actively cooled commodity as carrying an active container', () => {
    expect(
      idsOf(
        (commodity) =>
          commodity.temperature?.solution === TemperatureSolution.Active &&
          !commodity.shc.includes(SpecialHandlingCode.ActiveTemperatureControl),
      ),
    ).toEqual([]);
  });

  it('reports a heaviest piece only where the load is heavy or outsized', () => {
    expect(
      idsOf(
        (commodity) =>
          commodity.heaviestPiece !== undefined &&
          !commodity.shc.includes(SpecialHandlingCode.Heavy) &&
          !commodity.shc.includes(SpecialHandlingCode.Outsized),
      ),
    ).toEqual([]);
  });

  it('states positive dimensions for every heaviest piece', () => {
    expect(
      idsOf((commodity) => {
        const piece = commodity.heaviestPiece;

        if (!piece) {
          return false;
        }

        return (
          piece.kg <= 0 ||
          piece.lengthCm <= 0 ||
          piece.widthCm <= 0 ||
          piece.heightCm <= 0 ||
          piece.kg < commodity.piece.maxKg
        );
      }),
    ).toEqual([]);
  });

  it('requires a heated compartment only for live animals', () => {
    expect(
      idsOf(
        (commodity) =>
          commodity.compartment.requiresHeated &&
          !commodity.shc.includes(SpecialHandlingCode.LiveAnimals) &&
          !commodity.shc.includes(SpecialHandlingCode.LiveAnimalsHold),
      ),
    ).toEqual([]);
  });

  it('covers the specialities of the seeded airports', () => {
    expect(findCommodityById('cod-fresh')!.sources.airports).toContain('KEF');
    expect(findCommodityById('live-lobster')!.sources.airports).toContain(
      'BOS',
    );
    expect(findCommodityById('engine-fan-blades')!.sources.airports).toContain(
      'BRE',
    );
    expect(findCommodityById('perfumery')!.sources.airports).toContain('CDG');
    expect(findCommodityById('snow-crab')!.sources.airports).toContain('YYT');
  });
});
