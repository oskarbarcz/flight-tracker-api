import {
  CargoDeck,
  CompartmentLoading,
  HoldCompartment,
  HoldPosition,
  HoldVariant,
} from './hold-layout.model';
import { Commodity, TemperatureSolution } from './commodity.model';
import { drawCommodity, OfferedCommodity } from './commodity-selection';
import { capacityAt, fits, ULD_SPECS, UldSpec, UldType } from './uld';
import { volumeOf } from './cargo-volume';

export enum LoadUnitKind {
  Uld = 'uld',
  BulkLot = 'bulk_lot',
}

export const MIN_UNIT_PAYLOAD_KG = 200;
export const MIN_BULK_LOT_KG = 50;
const MIN_SHIPMENT_KG = 20;
const UNIT_FILL_FLOOR_KG = 60;

export type PlannedShipment = {
  commodityId: string;
  description: string;
  pieces: number;
  grossKg: number;
  volumeM3: number;
};

export type PlannedUnit = {
  kind: LoadUnitKind;
  uldType: UldType | null;
  positionDesignator: string | null;
  compartment: number | null;
  deck: CargoDeck | null;
  tareKg: number;
  grossKg: number;
  volumeM3: number;
  shipments: PlannedShipment[];
};

export type PlacementSlot = {
  deck: CargoDeck;
  compartment: HoldCompartment;
  position: HoldPosition;
};

export type LooseSlot = {
  deck: CargoDeck;
  compartment: HoldCompartment;
};

export type CargoLoadRequest = {
  targetKg: number;
  offered: OfferedCommodity[];
  slots: PlacementSlot[];
  looseSlots: LooseSlot[];
  random: () => number;
};

export function slotsOf(variant: HoldVariant): PlacementSlot[] {
  const byCompartment = variant.decks.map((deck) =>
    deck.compartments.map((compartment) =>
      compartment.positions.map((position) => ({
        deck: deck.deck,
        compartment,
        position,
      })),
    ),
  );

  const queues = byCompartment.flat().filter((queue) => queue.length > 0);
  const interleaved: PlacementSlot[] = [];
  const deepest = Math.max(0, ...queues.map((queue) => queue.length));

  for (let index = 0; index < deepest; index++) {
    for (const queue of queues) {
      const slot = queue[index];

      if (slot) {
        interleaved.push(slot);
      }
    }
  }

  return interleaved;
}

export function looseSlotsOf(variant: HoldVariant): LooseSlot[] {
  return variant.decks.flatMap((deck) =>
    deck.compartments
      .filter((compartment) => compartment.loading === CompartmentLoading.Loose)
      .map((compartment) => ({ deck: deck.deck, compartment })),
  );
}

export function needsActiveContainer(commodity: Commodity): boolean {
  return commodity.temperature?.solution === TemperatureSolution.Active;
}

export function canShareUnit(one: Commodity, other: Commodity): boolean {
  if (one.id === other.id) {
    return true;
  }

  if (one.dangerousGoods || other.dangerousGoods) {
    return false;
  }

  return one.temperature?.regime === other.temperature?.regime;
}

export function specFor(
  commodity: Commodity,
  position: HoldPosition,
): UldSpec | null {
  const candidates = Object.values(ULD_SPECS).filter(
    (spec) =>
      fits(spec, position) && spec.active === needsActiveContainer(commodity),
  );

  return (
    candidates.sort((one, other) => other.volumeM3 - one.volumeM3)[0] ?? null
  );
}

function pieceWeight(commodity: Commodity, roll: number): number {
  const { minKg, maxKg } = commodity.piece;

  return minKg + roll * (maxKg - minKg);
}

function desiredShipmentKg(commodity: Commodity, random: () => number): number {
  const pieces =
    commodity.minPieces +
    random() * (commodity.maxPieces - commodity.minPieces);

  return pieces * pieceWeight(commodity, random());
}

function shipmentOf(
  commodity: Commodity,
  grossKg: number,
  random: () => number,
): PlannedShipment {
  const perPiece = pieceWeight(commodity, random());
  const description =
    commodity.descriptions[
      Math.floor(random() * commodity.descriptions.length)
    ] ?? commodity.name;

  return {
    commodityId: commodity.id,
    description,
    pieces: Math.max(1, Math.round(grossKg / perPiece)),
    grossKg,
    volumeM3: round3(volumeOf(grossKg, commodity.densityKgM3)),
  };
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function fillUnit(
  first: Commodity,
  weightCapacityKg: number,
  volumeCapacityM3: number,
  budgetKg: number,
  offered: OfferedCommodity[],
  random: () => number,
): PlannedShipment[] {
  const shipments: PlannedShipment[] = [];
  let remainingWeight = Math.min(weightCapacityKg, budgetKg);
  let remainingVolume = volumeCapacityM3;
  let commodity: Commodity | null = first;

  while (
    commodity &&
    remainingWeight >= MIN_SHIPMENT_KG &&
    remainingVolume > 0
  ) {
    const byVolume = remainingVolume * commodity.densityKgM3;
    const take = Math.floor(
      Math.min(desiredShipmentKg(commodity, random), remainingWeight, byVolume),
    );

    if (take < MIN_SHIPMENT_KG) {
      break;
    }

    const shipment = shipmentOf(commodity, take, random);
    shipments.push(shipment);
    remainingWeight -= take;
    remainingVolume = round3(remainingVolume - shipment.volumeM3);

    if (remainingWeight < UNIT_FILL_FLOOR_KG || remainingVolume <= 0) {
      break;
    }

    const next = drawCommodity(offered, random());
    commodity = canShareUnit(first, next) ? next : null;
  }

  return shipments;
}

export function planCargoLoad(request: CargoLoadRequest): PlannedUnit[] {
  const { targetKg, offered, slots, looseSlots, random } = request;

  if (targetKg <= 0 || offered.length === 0) {
    return [];
  }

  const units: PlannedUnit[] = [];
  const compartmentLoad = new Map<number, number>();
  let budget = Math.round(targetKg);

  for (const slot of slots) {
    if (budget < MIN_UNIT_PAYLOAD_KG) {
      break;
    }

    const commodity = drawCommodity(offered, random());
    const spec = specFor(commodity, slot.position);

    if (!spec || budget < spec.tareKg + MIN_UNIT_PAYLOAD_KG) {
      continue;
    }

    const capacity = capacityAt(spec, slot.position);

    if (capacity.maxGrossKg < MIN_UNIT_PAYLOAD_KG) {
      continue;
    }

    const used = compartmentLoad.get(slot.compartment.number) ?? 0;
    const headroom = slot.compartment.maxWeightKg - used - spec.tareKg;

    if (headroom < MIN_UNIT_PAYLOAD_KG) {
      continue;
    }

    const shipments = fillUnit(
      commodity,
      Math.min(capacity.maxGrossKg, headroom),
      capacity.volumeM3,
      budget - spec.tareKg,
      offered,
      random,
    );

    if (shipments.length === 0) {
      continue;
    }

    const grossKg = shipments.reduce(
      (sum, shipment) => sum + shipment.grossKg,
      0,
    );

    budget -= spec.tareKg + grossKg;
    compartmentLoad.set(slot.compartment.number, used + spec.tareKg + grossKg);

    units.push({
      kind: LoadUnitKind.Uld,
      uldType: spec.type,
      positionDesignator: slot.position.designator,
      compartment: slot.compartment.number,
      deck: slot.deck,
      tareKg: spec.tareKg,
      grossKg,
      volumeM3: round3(
        shipments.reduce((sum, shipment) => sum + shipment.volumeM3, 0),
      ),
      shipments,
    });
  }

  if (budget >= MIN_BULK_LOT_KG || (budget > 0 && units.length === 0)) {
    units.push(bulkLot(budget, offered, looseSlots, random));

    return units;
  }

  if (budget > 0) {
    absorb(units[units.length - 1], budget);
  }

  return units;
}

function absorb(unit: PlannedUnit, extraKg: number): void {
  const shipment = unit.shipments[unit.shipments.length - 1];

  shipment.grossKg += extraKg;
  shipment.volumeM3 = round3(
    shipment.volumeM3 * (shipment.grossKg / (shipment.grossKg - extraKg)),
  );
  unit.grossKg += extraKg;
  unit.volumeM3 = round3(
    unit.shipments.reduce((sum, entry) => sum + entry.volumeM3, 0),
  );
}

function bulkLot(
  budgetKg: number,
  offered: OfferedCommodity[],
  looseSlots: LooseSlot[],
  random: () => number,
): PlannedUnit {
  const commodity = drawCommodity(offered, random());
  const shipment = shipmentOf(commodity, budgetKg, random);
  const slot = looseSlots[Math.floor(random() * looseSlots.length)];

  return {
    kind: LoadUnitKind.BulkLot,
    uldType: null,
    positionDesignator: null,
    compartment: slot?.compartment.number ?? null,
    deck: slot?.deck ?? null,
    tareKg: 0,
    grossKg: budgetKg,
    volumeM3: shipment.volumeM3,
    shipments: [shipment],
  };
}

export function totalCargoKg(units: PlannedUnit[]): number {
  return units.reduce((sum, unit) => sum + unit.tareKg + unit.grossKg, 0);
}
