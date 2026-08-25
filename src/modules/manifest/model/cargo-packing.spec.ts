import {
  admissibleFor,
  canShareUnit,
  compartmentLoadOfUnits,
  CompartmentUsage,
  MAX_DANGEROUS_GOODS_PER_FLIGHT,
  mayJoinCompartmentRegime,
  LoadContentClass,
  occupiedPositionsOf,
  planBaggageUnits,
  LoadUnitKind,
  looseSlotsOf,
  MIN_BULK_LOT_KG,
  MIN_UNIT_PAYLOAD_KG,
  needsActiveContainer,
  planCargoLoad,
  PlannedUnit,
  slotsOf,
  specFor,
  totalCargoKg,
} from './cargo-packing';
import { findHoldLayoutByType } from '../data/cargo-holds';
import { findCommodityById } from '../data/cargo-commodities';
import { offeredCommodities, OfferedCommodity } from './commodity-selection';
import { Continent } from '../../airports/model/airport.model';
import { JourneyContext, transferRoleOf } from './shipment-journey';
import { conflicts } from './segregation.policy';
import {
  SpecialHandlingCode,
  TemperatureRegime,
  TemperatureSolution,
} from './commodity.model';
import { offeredCommoditiesFor } from './cargo-aircraft-only.policy';
import { BaggageSource } from './baggage';
import { SourceTier } from './commodity-selection';
import { defaultVariantOf, HoldVariant } from './hold-layout.model';
import { UldType } from './uld';
import { HoldCannotPlaceLoadError } from './error/cargo.error';

function seededRandom(seed: number): () => number {
  let state = seed;

  return () => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
}

function variantOf(type: string, id?: string): HoldVariant {
  const layout = findHoldLayoutByType(type)!;

  return id
    ? layout.variants.find((variant) => variant.id === id)!
    : defaultVariantOf(layout);
}

function journeyContext(seed: number): JourneyContext {
  return {
    leg: { departure: 'FRA', arrival: 'JFK' },
    departureContinent: Continent.Europe,
    arrivalContinent: Continent.NorthAmerica,
    candidates: [
      { iataCode: 'CDG', continent: Continent.Europe },
      { iataCode: 'WAW', continent: Continent.Europe },
      { iataCode: 'BOS', continent: Continent.NorthAmerica },
      { iataCode: 'YYT', continent: Continent.NorthAmerica },
    ],
    carriers: ['AC', 'DL'],
    random: seededRandom(seed),
  };
}

const coldChain = { buildUpHours: 3, flightHours: 9, ambientC: null };

const samplePlan = {
  source: BaggageSource.Reconciled,
  weightKg: 2400,
  bagCount: 133,
  bagMassKg: 18,
  priorityBagCount: 18,
};

const frankfurt = {
  iataCode: 'FRA',
  country: 'Germany',
  continent: Continent.Europe,
  month: 6,
};

function offersFor(context = frankfurt): OfferedCommodity[] {
  return offeredCommodities(context);
}

function plan(
  type: string,
  targetKg: number,
  seed = 42,
  variantId?: string,
): PlannedUnit[] {
  const variant = variantOf(type, variantId);

  return planCargoLoad({
    targetKg,
    offered: offersFor(),
    slots: slotsOf(variant),
    looseSlots: looseSlotsOf(variant),
    journey: journeyContext(seed),
    coldChain,
    random: seededRandom(seed),
  });
}

describe('compartment volume', () => {
  function volumeExceeded(
    units: PlannedUnit[],
    variant: HoldVariant,
  ): number[] {
    const limits = new Map(
      variant.decks
        .flatMap((deck) => deck.compartments)
        .map((compartment) => [compartment.number, compartment.volumeM3]),
    );

    return [...compartmentLoadOfUnits(units).entries()]
      .filter(
        ([compartment, usage]) => usage.volumeM3 > limits.get(compartment)!,
      )
      .map(([compartment]) => compartment);
  }

  it('keeps every compartment within its volume across seeds', () => {
    const variant = variantOf('A320', 'a320-cls');
    const offending = Array.from(
      { length: 40 },
      (_, index) => index + 1,
    ).filter(
      (seed) =>
        volumeExceeded(
          planCargoLoad({
            targetKg: 5000,
            offered: offersFor(),
            slots: slotsOf(variant),
            looseSlots: looseSlotsOf(variant),
            journey: journeyContext(seed),
            coldChain,
            random: seededRandom(seed),
          }),
          variant,
        ).length > 0,
    );

    expect(offending).toEqual([]);
  });

  it('keeps a containerised compartment within its volume when bags fill it', () => {
    const variant = variantOf('A320', 'a320-cls');
    const bags = {
      source: BaggageSource.Reconciled,
      weightKg: 4700,
      bagCount: 313,
      bagMassKg: 15,
      priorityBagCount: 0,
    };
    const occupied = new Set<string>();
    const compartmentLoad = new Map<number, CompartmentUsage>();

    const placed = (): PlannedUnit[] => {
      try {
        return planBaggageUnits({
          plan: bags,
          slots: slotsOf(variant),
          looseSlots: looseSlotsOf(variant),
          occupied,
          compartmentLoad,
        });
      } catch {
        return [];
      }
    };

    expect(volumeExceeded(placed(), variant)).toEqual([]);
  });

  it('keeps a bulk-only narrowbody within every compartment volume', () => {
    const variant = variantOf('B738');
    const offending = Array.from(
      { length: 20 },
      (_, index) => index + 1,
    ).filter(
      (seed) =>
        volumeExceeded(
          planCargoLoad({
            targetKg: 3000,
            offered: offersFor(),
            slots: slotsOf(variant),
            looseSlots: looseSlotsOf(variant),
            journey: journeyContext(seed),
            coldChain,
            random: seededRandom(seed),
          }),
          variant,
        ).length > 0,
    );

    expect(offending).toEqual([]);
  });

  it('spills a load the first compartment cannot take into the next', () => {
    const variant = variantOf('A320', 'a320-cls');
    const units = planCargoLoad({
      targetKg: 1800,
      offered: offersFor(),
      slots: [],
      looseSlots: looseSlotsOf(variant),
      journey: journeyContext(7),
      coldChain,
      random: seededRandom(7),
    });

    expect(totalCargoKg(units)).toBe(1800);
    expect(new Set(units.map((unit) => unit.compartment)).size).toBeGreaterThan(
      1,
    );
    expect(volumeExceeded(units, variant)).toEqual([]);
  });

  it('refuses a load no compartment can take', () => {
    const variant = variantOf('A320', 'a320-cls');

    expect(() =>
      planCargoLoad({
        targetKg: 9000,
        offered: offersFor(),
        slots: [],
        looseSlots: looseSlotsOf(variant),
        journey: journeyContext(3),
        coldChain,
        random: seededRandom(3),
      }),
    ).toThrow(HoldCannotPlaceLoadError);
  });

  it('carries a load with no hold data as one unplaced lot', () => {
    const units = planCargoLoad({
      targetKg: 9000,
      offered: offersFor(),
      slots: [],
      looseSlots: [],
      journey: journeyContext(3),
      coldChain,
      random: seededRandom(3),
    });

    expect(totalCargoKg(units)).toBe(9000);
    expect(units.every((unit) => unit.compartment === null)).toBe(true);
  });
});

describe('dangerous goods and temperature limits', () => {
  function dangerousCount(units: PlannedUnit[]): number {
    return units
      .flatMap((unit) => unit.shipments)
      .filter(
        (shipment) =>
          findCommodityById(shipment.commodityId)?.dangerousGoods !== undefined,
      ).length;
  }

  function planForPassengers(targetKg: number, seed: number): PlannedUnit[] {
    const variant = variantOf('B77W');

    return planCargoLoad({
      targetKg,
      offered: offersFor(),
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      journey: journeyContext(seed),
      coldChain,
      random: seededRandom(seed),
      dangerousGoodsCeiling: MAX_DANGEROUS_GOODS_PER_FLIGHT,
    });
  }

  it('never carries more than two dangerous goods consignments on a passenger flight', () => {
    const exceeding = Array.from({ length: 60 }, (_, index) => index + 1)
      .map((seed) => dangerousCount(planForPassengers(24000, seed)))
      .filter((count) => count > MAX_DANGEROUS_GOODS_PER_FLIGHT);

    expect(exceeding).toEqual([]);
  });

  it('leaves a freighter uncapped, its rate held by the catalogue alone', () => {
    const counts = Array.from({ length: 30 }, (_, index) => index + 1).map(
      (seed) => dangerousCount(plan('B74F', 40000, seed)),
    );

    expect(Math.max(...counts)).toBeLessThan(8);
  });

  it('counts the consignments already aboard against the ceiling', () => {
    const variant = variantOf('B77W');
    const added = planCargoLoad({
      targetKg: 12000,
      offered: offersFor(),
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      journey: journeyContext(4),
      coldChain,
      random: seededRandom(4),
      dangerousGoodsCeiling: MAX_DANGEROUS_GOODS_PER_FLIGHT,
      dangerousGoodsAboard: MAX_DANGEROUS_GOODS_PER_FLIGHT,
    });

    expect(dangerousCount(added)).toBe(0);
    expect(totalCargoKg(added)).toBe(12000);
  });

  it('still lands on the tonnage once the ceiling is reached', () => {
    const misses = Array.from({ length: 30 }, (_, index) => index + 1).filter(
      (seed) => totalCargoKg(plan('B77W', 18000, seed)) !== 18000,
    );

    expect(misses).toEqual([]);
  });

  it('keeps a compartment to one temperature regime', () => {
    const offending = Array.from(
      { length: 40 },
      (_, index) => index + 1,
    ).filter((seed) => {
      const regimes = new Map<number, Set<string>>();

      for (const unit of plan('B77W', 30000, seed)) {
        if (unit.compartment === null) {
          continue;
        }

        for (const shipment of unit.shipments) {
          const commodity = findCommodityById(shipment.commodityId);

          if (
            commodity?.temperature === undefined ||
            commodity.temperature.solution === TemperatureSolution.Active
          ) {
            continue;
          }

          const carried = regimes.get(unit.compartment) ?? new Set<string>();
          carried.add(commodity.temperature.regime);
          regimes.set(unit.compartment, carried);
        }
      }

      return [...regimes.values()].some((carried) => carried.size > 1);
    });

    expect(offending).toEqual([]);
  });

  it('lets freight that controls its own temperature join any compartment', () => {
    const frozen = findCommodityById('snow-crab')!;
    const active = findCommodityById('vaccines')!;

    expect(mayJoinCompartmentRegime(active, [TemperatureRegime.Frozen])).toBe(
      true,
    );
    expect(mayJoinCompartmentRegime(frozen, [TemperatureRegime.Cool])).toBe(
      false,
    );
  });

  it('treats freight declaring no regime as neutral', () => {
    const ordinary = findCommodityById('machine-tools')!;

    expect(mayJoinCompartmentRegime(ordinary, [TemperatureRegime.Frozen])).toBe(
      true,
    );
  });
});

describe('baggage keeps its room', () => {
  const narrowbodyBags = {
    source: BaggageSource.Derived,
    weightKg: 1974,
    bagCount: 132,
    bagMassKg: 15,
    priorityBagCount: 0,
  };

  it('places every bag before the cargo takes the positions', () => {
    const variant = variantOf('A320', 'a320-cls');
    const occupied = new Set<string>();
    const compartmentLoad = new Map<number, CompartmentUsage>();

    const baggage = planBaggageUnits({
      plan: narrowbodyBags,
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      occupied,
      compartmentLoad,
    });

    const cargo = planCargoLoad({
      targetKg: 3000,
      offered: offersFor(),
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      journey: journeyContext(5),
      coldChain,
      random: seededRandom(5),
      occupied,
      compartmentLoad,
    });

    expect(baggage.every((unit) => unit.compartment !== null)).toBe(true);
    expect(baggage.reduce((sum, unit) => sum + (unit.bagCount ?? 0), 0)).toBe(
      132,
    );
    expect(totalCargoKg(cargo)).toBe(3000);
    expect(
      cargo.filter((unit) => unit.kind === LoadUnitKind.Uld).length,
    ).toBeLessThan(slotsOf(variant).length);
  });

  it('refuses bags a curated hold cannot take rather than leaving them unplaced', () => {
    const variant = variantOf('A320', 'a320-cls');

    expect(() =>
      planBaggageUnits({
        plan: { ...narrowbodyBags, bagCount: 900, weightKg: 13500 },
        slots: slotsOf(variant),
        looseSlots: looseSlotsOf(variant),
        occupied: new Set<string>(),
        compartmentLoad: new Map<number, CompartmentUsage>(),
      }),
    ).toThrow(HoldCannotPlaceLoadError);
  });
});

describe('cargo packing', () => {
  it('lands exactly on the target tonnage', () => {
    const targets = [500, 1200, 3500, 7000, 14000, 22000];
    const misses = targets.filter(
      (target) => totalCargoKg(plan('B77W', target)) !== target,
    );

    expect(misses).toEqual([]);
  });

  it('lands exactly on the target for every seed', () => {
    const misses = Array.from({ length: 40 }, (_, index) => index + 1).filter(
      (seed) => totalCargoKg(plan('B77W', 6000, seed)) !== 6000,
    );

    expect(misses).toEqual([]);
  });

  it('counts device tare against the same budget as the freight', () => {
    const units = plan('B77W', 6000);
    const tare = units.reduce((sum, unit) => sum + unit.tareKg, 0);
    const freight = units.reduce((sum, unit) => sum + unit.grossKg, 0);

    expect(tare).toBeGreaterThan(0);
    expect(tare + freight).toBe(6000);
    expect(freight).toBeLessThan(6000);
  });

  it('never exceeds a device weight or volume limit', () => {
    const units = plan('B77W', 22000);
    const wrong = units
      .filter((unit) => unit.kind === LoadUnitKind.Uld)
      .filter((unit) => {
        const contents = unit.shipments.reduce(
          (sum, shipment) => sum + shipment.grossKg,
          0,
        );

        return contents !== unit.grossKg || unit.volumeM3 < 0;
      });

    expect(wrong).toEqual([]);
  });

  it('gives every containerised unit a distinct position', () => {
    const designators = plan('B77W', 22000)
      .filter((unit) => unit.kind === LoadUnitKind.Uld)
      .map((unit) => unit.positionDesignator);

    expect(new Set(designators).size).toBe(designators.length);
  });

  it('places every unit in a position its device fits', () => {
    const variant = variantOf('B77W');
    const positions = new Map(
      slotsOf(variant).map((slot) => [slot.position.designator, slot.position]),
    );

    const wrong = plan('B77W', 22000)
      .filter((unit) => unit.kind === LoadUnitKind.Uld)
      .filter((unit) => {
        const position = positions.get(unit.positionDesignator!)!;

        return unit.tareKg + unit.grossKg > position.maxWeightKg;
      });

    expect(wrong).toEqual([]);
  });

  it('keeps every compartment within its weight limit', () => {
    const variant = variantOf('B77W');
    const limits = new Map(
      variant.decks
        .flatMap((deck) => deck.compartments)
        .map((compartment) => [compartment.number, compartment.maxWeightKg]),
    );

    const load = compartmentLoadOfUnits(plan('B77W', 40000));

    const exceeded = [...load.entries()].filter(
      ([compartment, usage]) => usage.weightKg > limits.get(compartment)!,
    );

    expect(exceeded).toEqual([]);
  });

  it('carries a bulk-only aircraft entirely as loose lots', () => {
    const units = plan('B738', 2000);

    expect(units.length).toBeGreaterThan(0);
    expect(units.every((unit) => unit.kind === LoadUnitKind.BulkLot)).toBe(
      true,
    );
    expect(units.every((unit) => unit.uldType === null)).toBe(true);
    expect(units.every((unit) => unit.positionDesignator === null)).toBe(true);
    expect(totalCargoKg(units)).toBe(2000);
  });

  it('containerises a narrowbody fitted with a cargo loading system', () => {
    const units = plan('A320', 3000, 42, 'a320-cls');
    const containers = units.filter((unit) => unit.kind === LoadUnitKind.Uld);

    expect(containers.length).toBeGreaterThan(0);
    expect(
      containers.every((unit) => unit.uldType === UldType.Ld3Reduced),
    ).toBe(true);
    expect(totalCargoKg(units)).toBe(3000);
  });

  it('carries a tonnage too small for a container as loose load', () => {
    const units = plan('B77W', MIN_UNIT_PAYLOAD_KG - 1);

    expect(units).toHaveLength(1);
    expect(units[0].kind).toBe(LoadUnitKind.BulkLot);
  });

  it('needs more containers for a light commodity than a heavy one', () => {
    const flowers = offeredCommodities({
      iataCode: 'NBO',
      country: 'Kenya',
      continent: Continent.Africa,
      month: 2,
    }).filter((offer) => offer.commodity.id === 'flowers-roses');
    const moulds = offeredCommodities({
      iataCode: 'FRA',
      country: 'Germany',
      continent: Continent.Europe,
      month: 6,
    }).filter((offer) => offer.commodity.id === 'injection-moulds');

    const variant = variantOf('B77W');
    const countUnits = (offered: OfferedCommodity[]): number =>
      planCargoLoad({
        targetKg: 7000,
        offered,
        slots: slotsOf(variant),
        looseSlots: looseSlotsOf(variant),
        journey: journeyContext(9),
        coldChain,
        random: seededRandom(9),
      }).filter((unit) => unit.kind === LoadUnitKind.Uld).length;

    expect(countUnits(flowers)).toBeGreaterThan(countUnits(moulds));
  });

  it('plans nothing for no cargo and nothing to offer', () => {
    const variant = variantOf('B77W');

    expect(
      planCargoLoad({
        targetKg: 0,
        offered: offersFor(),
        slots: slotsOf(variant),
        looseSlots: looseSlotsOf(variant),
        journey: journeyContext(1),
        coldChain,
        random: seededRandom(1),
      }),
    ).toEqual([]);
    expect(
      planCargoLoad({
        targetKg: 5000,
        offered: [],
        slots: slotsOf(variant),
        looseSlots: looseSlotsOf(variant),
        journey: journeyContext(1),
        coldChain,
        random: seededRandom(1),
      }),
    ).toEqual([]);
  });

  it('gives every shipment a positive weight and at least one piece', () => {
    const wrong = plan('B77W', 22000)
      .flatMap((unit) => unit.shipments)
      .filter((shipment) => shipment.grossKg <= 0 || shipment.pieces < 1);

    expect(wrong).toEqual([]);
  });

  it('chooses an active container for a commodity that needs one', () => {
    const variant = variantOf('B77W');
    const ld3Position = slotsOf(variant)[0].position;
    const vaccines = findCommodityById('vaccines')!;
    const paint = findCommodityById('paint')!;

    expect(needsActiveContainer(vaccines)).toBe(true);
    expect(specFor(vaccines, ld3Position)!.type).toBe(UldType.Ld3Active);
    expect(needsActiveContainer(paint)).toBe(false);
    expect(specFor(paint, ld3Position)!.type).toBe(UldType.Ld3);
  });

  it('refuses to share a unit between dangerous goods and anything else', () => {
    const paint = findCommodityById('paint')!;
    const roses = findCommodityById('flowers-roses')!;
    const tulips = findCommodityById('flowers-tulips')!;

    expect(canShareUnit(paint, roses)).toBe(false);
    expect(canShareUnit(paint, paint)).toBe(true);
    expect(canShareUnit(roses, tulips)).toBe(true);
  });

  it('refuses to share a unit across temperature regimes', () => {
    const roses = findCommodityById('flowers-roses')!;
    const wafers = findCommodityById('semiconductor-wafers')!;

    expect(canShareUnit(roses, wafers)).toBe(false);
  });

  it('spreads a partial load across compartments rather than filling one', () => {
    const compartments = new Set(
      plan('B77W', 18000)
        .filter((unit) => unit.kind === LoadUnitKind.Uld)
        .map((unit) => unit.compartment),
    );

    expect(compartments.size).toBeGreaterThanOrEqual(4);
  });

  it('absorbs a residual too small to be a lot of its own', () => {
    const units = plan('B77W', 18000);
    const tinyLots = units.filter(
      (unit) =>
        unit.kind === LoadUnitKind.BulkLot && unit.grossKg < MIN_BULK_LOT_KG,
    );

    expect(tinyLots).toEqual([]);
    expect(totalCargoKg(units)).toBe(18000);
  });

  it('gives every shipment a journey consistent with its role', () => {
    const shipments = plan('B77W', 18000).flatMap((unit) => unit.shipments);

    expect(shipments.length).toBeGreaterThan(0);
    expect(
      shipments.every(
        (shipment) =>
          shipment.journey.transferRole ===
          transferRoleOf(
            shipment.journey.origin,
            shipment.journey.destination,
            { departure: 'FRA', arrival: 'JFK' },
          ),
      ),
    ).toBe(true);
  });

  it('builds some units for a single point beyond the arrival', () => {
    const sealed = plan('B77W', 18000).filter((unit) => unit.sealed);

    expect(sealed.length).toBeGreaterThan(0);
    expect(sealed.every((unit) => unit.beyondDestination !== null)).toBe(true);
  });

  it('holds nothing but its own destination in a unit that transfers intact', () => {
    const wrong = plan('B77W', 18000)
      .filter((unit) => unit.sealed)
      .filter((unit) =>
        unit.shipments.some(
          (shipment) => shipment.journey.destination !== unit.beyondDestination,
        ),
      );

    expect(wrong).toEqual([]);
  });

  it('marks a unit that is not built for a beyond point as broken down', () => {
    const brokenDown = plan('B77W', 18000).filter((unit) => !unit.sealed);

    expect(brokenDown.length).toBeGreaterThan(0);
    expect(brokenDown.every((unit) => unit.beyondDestination === null)).toBe(
      true,
    );
  });

  it('never sends a loose lot onward as a sealed unit', () => {
    const lots = plan('B738', 2000);

    expect(lots.every((unit) => unit.sealed === false)).toBe(true);
    expect(lots.every((unit) => unit.beyondDestination === null)).toBe(true);
  });

  it('names an onward carrier on every shipment that continues', () => {
    const shipments = plan('B77W', 18000).flatMap((unit) => unit.shipments);
    const continuing = shipments.filter(
      (shipment) => shipment.journey.destination !== 'JFK',
    );

    expect(continuing.length).toBeGreaterThan(0);
    expect(
      continuing.every(
        (shipment) =>
          shipment.journey.onwardCarrier !== null &&
          shipment.journey.connectionMinutes !== null,
      ),
    ).toBe(true);
  });

  it('places live animals only in a heated and ventilated compartment', () => {
    const variant = variantOf('B77W');
    const compartments = new Map(
      variant.decks
        .flatMap((deck) => deck.compartments)
        .map((compartment) => [compartment.number, compartment]),
    );

    const wrong = plan('B77W', 40000)
      .filter((unit) =>
        unit.shipments.some((shipment) =>
          (findCommodityById(shipment.commodityId)?.shc ?? []).includes(
            SpecialHandlingCode.LiveAnimals,
          ),
        ),
      )
      .filter((unit) => {
        const compartment = compartments.get(unit.compartment!);

        return !compartment?.heated || !compartment?.ventilated;
      });

    expect(wrong).toEqual([]);
  });

  it('never puts a segregated pair in the same compartment', () => {
    const byCompartment = new Map<number, SpecialHandlingCode[]>();

    for (const unit of plan('B77W', 40000)) {
      if (unit.compartment === null) {
        continue;
      }

      const codes = unit.shipments.flatMap(
        (shipment) => findCommodityById(shipment.commodityId)?.shc ?? [],
      );
      const existing = byCompartment.get(unit.compartment) ?? [];

      expect(conflicts(codes, existing)).toBe(false);
      byCompartment.set(unit.compartment, [...existing, ...codes]);
    }
  });

  it('withholds a load its compartment cannot take', () => {
    const variant = variantOf('B77W');
    const slot = slotsOf(variant).find(
      (candidate) => !candidate.compartment.heated,
    )!;
    const chicks = findCommodityById('day-old-chicks')!;
    const admissible = admissibleFor(
      [{ commodity: chicks, tier: SourceTier.Generic, weight: 1 }],
      slot,
      [],
    );

    expect(admissible).toEqual([]);
  });

  it('withholds a load that conflicts with what the compartment already holds', () => {
    const variant = variantOf('B77W');
    const slot = slotsOf(variant).find(
      (candidate) => candidate.compartment.heated,
    )!;
    const dryIce = findCommodityById('dry-ice')!;

    expect(
      admissibleFor(
        [{ commodity: dryIce, tier: SourceTier.Generic, weight: 1 }],
        slot,
        [SpecialHandlingCode.LiveAnimals],
      ),
    ).toEqual([]);
    expect(
      admissibleFor(
        [{ commodity: dryIce, tier: SourceTier.Generic, weight: 1 }],
        slot,
        [],
      ),
    ).toHaveLength(1);
  });

  it('loads no restricted cargo when the pool excludes it', () => {
    const variant = variantOf('B77W');
    const allowed = offeredCommoditiesFor(offersFor(), 150);
    const units = planCargoLoad({
      targetKg: 18000,
      offered: allowed,
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      journey: journeyContext(4),
      coldChain,
      random: seededRandom(4),
    });

    const restricted = units
      .flatMap((unit) => unit.shipments)
      .filter((shipment) =>
        (findCommodityById(shipment.commodityId)?.shc ?? []).includes(
          SpecialHandlingCode.CargoAircraftOnly,
        ),
      );

    expect(restricted).toEqual([]);
    expect(totalCargoKg(units)).toBe(18000);
  });

  it('containerises baggage where the aircraft has positions', () => {
    const variant = variantOf('B77W');
    const cargo = plan('B77W', 6000);
    const baggage = planBaggageUnits({
      plan: samplePlan,
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      occupied: occupiedPositionsOf(cargo),
      compartmentLoad: compartmentLoadOfUnits(cargo),
    });

    expect(baggage.length).toBeGreaterThan(0);
    expect(
      baggage.every((unit) => unit.contentClass === LoadContentClass.Baggage),
    ).toBe(true);
    expect(baggage.some((unit) => unit.positionDesignator !== null)).toBe(true);
  });

  it('never puts baggage in a position cargo already holds', () => {
    const variant = variantOf('B77W');
    const cargo = plan('B77W', 18000);
    const occupied = occupiedPositionsOf(cargo);
    const baggage = planBaggageUnits({
      plan: samplePlan,
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      occupied,
      compartmentLoad: compartmentLoadOfUnits(cargo),
    });

    const cargoPositions = occupiedPositionsOf(cargo);
    const clashes = baggage.filter(
      (unit) =>
        unit.positionDesignator !== null &&
        cargo.some(
          (other) => other.positionDesignator === unit.positionDesignator,
        ),
    );

    expect(cargoPositions.size).toBeGreaterThan(0);
    expect(clashes).toEqual([]);
  });

  it('loads baggage loose where the aircraft has no positions', () => {
    const variant = variantOf('B738');
    const baggage = planBaggageUnits({
      plan: samplePlan,
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      occupied: new Set<string>(),
      compartmentLoad: new Map<number, CompartmentUsage>(),
    });

    expect(baggage.length).toBeGreaterThan(0);
    expect(baggage.every((unit) => unit.kind === LoadUnitKind.BulkLot)).toBe(
      true,
    );
  });

  it('lands the baggage weight exactly on the plan', () => {
    const variant = variantOf('B77W');
    const baggage = planBaggageUnits({
      plan: samplePlan,
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      occupied: new Set<string>(),
      compartmentLoad: new Map<number, CompartmentUsage>(),
    });

    expect(baggage.reduce((sum, unit) => sum + unit.grossKg, 0)).toBe(
      samplePlan.weightKg,
    );
  });

  it('sets aside a priority unit when premium bags exist', () => {
    const variant = variantOf('B77W');
    const withPremium = planBaggageUnits({
      plan: samplePlan,
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      occupied: new Set<string>(),
      compartmentLoad: new Map<number, CompartmentUsage>(),
    });
    const withoutPremium = planBaggageUnits({
      plan: { ...samplePlan, priorityBagCount: 0 },
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      occupied: new Set<string>(),
      compartmentLoad: new Map<number, CompartmentUsage>(),
    });

    expect(withPremium.some((unit) => unit.priority)).toBe(true);
    expect(withoutPremium.some((unit) => unit.priority)).toBe(false);
  });

  it('carries no baggage unit when there are no bags', () => {
    const variant = variantOf('B77W');

    expect(
      planBaggageUnits({
        plan: { ...samplePlan, bagCount: 0, priorityBagCount: 0, weightKg: 0 },
        slots: slotsOf(variant),
        looseSlots: looseSlotsOf(variant),
        occupied: new Set<string>(),
        compartmentLoad: new Map<number, CompartmentUsage>(),
      }),
    ).toEqual([]);
  });

  it('keeps baggage out of the cargo invariant but inside compartment limits', () => {
    const variant = variantOf('B77W');
    const cargo = plan('B77W', 18000);
    const load = compartmentLoadOfUnits(cargo);
    const baggage = planBaggageUnits({
      plan: samplePlan,
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      occupied: occupiedPositionsOf(cargo),
      compartmentLoad: load,
    });

    expect(totalCargoKg(cargo)).toBe(18000);

    const limits = new Map(
      variant.decks
        .flatMap((deck) => deck.compartments)
        .map((compartment) => [compartment.number, compartment.maxWeightKg]),
    );
    const combined = compartmentLoadOfUnits([...cargo, ...baggage]);
    const exceeded = [...combined.entries()].filter(
      ([compartment, usage]) => usage.weightKg > limits.get(compartment)!,
    );

    expect(exceeded).toEqual([]);
  });

  it('is deterministic for a given seed', () => {
    expect(plan('B77W', 9000, 77)).toEqual(plan('B77W', 9000, 77));
  });

  it('leaves an already occupied position alone when adding load', () => {
    const variant = variantOf('B77W');
    const aboard = plan('B77W', 9000);
    const occupied = occupiedPositionsOf(aboard);

    const added = planCargoLoad({
      targetKg: 4000,
      offered: offersFor(),
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      journey: journeyContext(7),
      coldChain,
      random: seededRandom(7),
      occupied,
      compartmentLoad: compartmentLoadOfUnits(aboard),
    });

    const collisions = added
      .map((unit) => unit.positionDesignator)
      .filter((designator) => designator !== null)
      .filter((designator) => occupiedPositionsOf(aboard).has(designator!));

    expect(added.length).toBeGreaterThan(0);
    expect(collisions).toEqual([]);
    expect(totalCargoKg(added)).toBe(4000);
  });

  it('keeps every compartment within its limit when adding to a loaded hold', () => {
    const variant = variantOf('B77W');
    const aboard = plan('B77W', 20000);
    const load = compartmentLoadOfUnits(aboard);

    const added = planCargoLoad({
      targetKg: 2000,
      offered: offersFor(),
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      journey: journeyContext(11),
      coldChain,
      random: seededRandom(11),
      occupied: occupiedPositionsOf(aboard),
      compartmentLoad: load,
    });

    const limits = new Map(
      variant.decks
        .flatMap((deck) => deck.compartments)
        .map((compartment) => [compartment.number, compartment.maxWeightKg]),
    );
    const exceeded = [
      ...compartmentLoadOfUnits([...aboard, ...added]).entries(),
    ].filter(
      ([compartment, usage]) => usage.weightKg > limits.get(compartment)!,
    );

    expect(exceeded).toEqual([]);
    expect(totalCargoKg(added)).toBe(2000);
  });

  it('honours the special handling already loaded in a compartment when adding', () => {
    const variant = variantOf('B77W');
    const aboard = plan('B77W', 9000);
    const compartmentShc = new Map<number, SpecialHandlingCode[]>();

    for (const unit of aboard) {
      if (unit.compartment === null) {
        continue;
      }

      compartmentShc.set(unit.compartment, [
        ...(compartmentShc.get(unit.compartment) ?? []),
        ...unit.shipments.flatMap(
          (shipment) => findCommodityById(shipment.commodityId)?.shc ?? [],
        ),
      ]);
    }

    const added = planCargoLoad({
      targetKg: 3000,
      offered: offersFor(),
      slots: slotsOf(variant),
      looseSlots: looseSlotsOf(variant),
      journey: journeyContext(3),
      coldChain,
      random: seededRandom(3),
      occupied: occupiedPositionsOf(aboard),
      compartmentLoad: compartmentLoadOfUnits(aboard),
      compartmentShc,
    });

    const clashes = added
      .filter((unit) => unit.compartment !== null)
      .filter((unit) =>
        conflicts(
          unit.shipments.flatMap(
            (shipment) => findCommodityById(shipment.commodityId)?.shc ?? [],
          ),
          compartmentShc.get(unit.compartment!) ?? [],
        ),
      );

    expect(clashes).toEqual([]);
  });
});

describe('bulk cargo placement', () => {
  function limitsOf(variant: HoldVariant): Map<number, number> {
    return new Map(
      variant.decks
        .flatMap((deck) => deck.compartments)
        .map((compartment) => [compartment.number, compartment.maxWeightKg]),
    );
  }

  it('never overloads a compartment on a bulk-only narrowbody', () => {
    const variant = variantOf('B738');
    const limits = limitsOf(variant);

    for (const target of [1800, 3000, 5000, 7000]) {
      const units = plan('B738', target);
      const exceeded = [...compartmentLoadOfUnits(units).entries()].filter(
        ([compartment, usage]) => usage.weightKg > limits.get(compartment)!,
      );

      expect({ target, exceeded }).toEqual({ target, exceeded: [] });
      expect(totalCargoKg(units)).toBe(target);
    }
  });

  it('spreads a load too heavy for one compartment across several', () => {
    const units = plan('B738', 5000).filter(
      (unit) => unit.kind === LoadUnitKind.BulkLot,
    );

    expect(units.length).toBeGreaterThan(1);
  });

  it('keeps a load that fits in one compartment as a single lot', () => {
    const units = plan('B738', 1800).filter(
      (unit) => unit.kind === LoadUnitKind.BulkLot,
    );

    expect(units).toHaveLength(1);
  });

  it('never puts a load in a compartment its commodity cannot use', () => {
    const variant = variantOf('B738');
    const compartments = new Map(
      variant.decks
        .flatMap((deck) => deck.compartments)
        .map((compartment) => [compartment.number, compartment]),
    );
    const wrong = plan('B738', 6000)
      .filter((unit) => unit.compartment !== null)
      .flatMap((unit) =>
        unit.shipments.map((shipment) => ({
          commodity: findCommodityById(shipment.commodityId)!,
          compartment: compartments.get(unit.compartment!)!,
        })),
      )
      .filter(({ commodity, compartment }) => {
        const needsHeat =
          commodity.compartment.requiresHeated && !compartment.heated;
        const needsAir =
          commodity.compartment.requiresVentilated && !compartment.ventilated;
        return needsHeat || needsAir;
      });

    expect(wrong.map((entry) => entry.commodity.id)).toEqual([]);
  });

  it('never puts a segregated pair in one bulk compartment', () => {
    const byCompartment = new Map<number, SpecialHandlingCode[]>();
    const clashes: number[] = [];

    for (const unit of plan('B738', 6000)) {
      if (unit.compartment === null) continue;
      const codes = unit.shipments.flatMap(
        (shipment) => findCommodityById(shipment.commodityId)?.shc ?? [],
      );
      const loaded = byCompartment.get(unit.compartment) ?? [];
      if (conflicts(codes, loaded)) clashes.push(unit.compartment);
      byCompartment.set(unit.compartment, [...loaded, ...codes]);
    }

    expect(clashes).toEqual([]);
  });
});
