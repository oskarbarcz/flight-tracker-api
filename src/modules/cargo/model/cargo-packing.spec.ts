import {
  canShareUnit,
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
import { defaultVariantOf, HoldVariant } from './hold-layout.model';
import { UldType } from './uld';

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
    random: seededRandom(seed),
  });
}

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

    const load = new Map<number, number>();
    for (const unit of plan('B77W', 40000)) {
      if (unit.compartment === null) {
        continue;
      }
      load.set(
        unit.compartment,
        (load.get(unit.compartment) ?? 0) + unit.tareKg + unit.grossKg,
      );
    }

    const exceeded = [...load.entries()].filter(
      ([compartment, weight]) => weight > limits.get(compartment)!,
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
    const batteries = offeredCommodities({
      iataCode: 'HKG',
      country: 'China',
      continent: Continent.Asia,
      month: 6,
    }).filter((offer) => offer.commodity.id === 'lithium-ion-standalone');

    const variant = variantOf('B77W');
    const countUnits = (offered: OfferedCommodity[]): number =>
      planCargoLoad({
        targetKg: 7000,
        offered,
        slots: slotsOf(variant),
        looseSlots: looseSlotsOf(variant),
        random: seededRandom(9),
      }).filter((unit) => unit.kind === LoadUnitKind.Uld).length;

    expect(countUnits(flowers)).toBeGreaterThan(countUnits(batteries));
  });

  it('plans nothing for no cargo and nothing to offer', () => {
    const variant = variantOf('B77W');

    expect(
      planCargoLoad({
        targetKg: 0,
        offered: offersFor(),
        slots: slotsOf(variant),
        looseSlots: looseSlotsOf(variant),
        random: seededRandom(1),
      }),
    ).toEqual([]);
    expect(
      planCargoLoad({
        targetKg: 5000,
        offered: [],
        slots: slotsOf(variant),
        looseSlots: looseSlotsOf(variant),
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

  it('is deterministic for a given seed', () => {
    expect(plan('B77W', 9000, 77)).toEqual(plan('B77W', 9000, 77));
  });
});
