import {
  CargoDeck,
  CompartmentLoading,
  HoldCompartment,
  HoldPosition,
  HoldVariant,
} from './hold-layout.model';
import {
  Commodity,
  SpecialHandlingCode,
  TemperatureSolution,
} from './commodity.model';
import { drawCommodity, OfferedCommodity } from './commodity-selection';
import { capacityAt, fits, ULD_SPECS, UldSpec, UldType } from './uld';
import { volumeOf } from './cargo-volume';
import {
  drawBeyondPoint,
  drawJourney,
  JourneyContext,
  ShipmentJourney,
} from './shipment-journey';
import {
  compartmentAccepts,
  conflicts,
  mayJoinCompartment,
} from './segregation.policy';
import {
  assessColdChain,
  ColdChainAssessment,
  ColdChainExposure,
} from './cold-chain';
import { BaggagePlan, BaggageSource } from './baggage';

export enum LoadUnitKind {
  Uld = 'uld',
  BulkLot = 'bulk_lot',
}

export enum LoadContentClass {
  Cargo = 'cargo',
  Baggage = 'baggage',
  Mail = 'mail',
}

export const BAGS_PER_CUBIC_METRE = 10;

export const MIN_UNIT_PAYLOAD_KG = 200;
export const MIN_BULK_LOT_KG = 50;
export const SEALED_UNIT_CHANCE = 0.35;
const MIN_SHIPMENT_KG = 20;
const UNIT_FILL_FLOOR_KG = 60;
const MIN_ONWARD_FLIGHT_HOURS = 2;
const MAX_ONWARD_FLIGHT_HOURS = 12;

export type PlannedShipment = {
  commodityId: string;
  description: string;
  pieces: number;
  grossKg: number;
  volumeM3: number;
  journey: ShipmentJourney;
  coldChain: ColdChainAssessment | null;
};

export type ColdChainContext = {
  buildUpHours: number;
  flightHours: number;
  ambientC: number | null;
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
  beyondDestination: string | null;
  sealed: boolean;
  contentClass: LoadContentClass;
  bagCount: number | null;
  priority: boolean;
  baggageSource: BaggageSource | null;
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
  journey: JourneyContext;
  coldChain: ColdChainContext;
  random: () => number;
  occupied?: Set<string>;
  compartmentLoad?: Map<number, number>;
  compartmentShc?: Map<number, SpecialHandlingCode[]>;
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

  if (conflicts(one.shc, other.shc)) {
    return false;
  }

  return one.temperature?.regime === other.temperature?.regime;
}

export function admissibleFor(
  offered: OfferedCommodity[],
  slot: PlacementSlot,
  loadedShc: SpecialHandlingCode[],
): OfferedCommodity[] {
  return offered.filter(
    (offer) =>
      compartmentAccepts(offer.commodity, slot.compartment) &&
      mayJoinCompartment(offer.commodity.shc, loadedShc),
  );
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

export function exposureFor(
  context: ColdChainContext,
  journey: ShipmentJourney,
  random: () => number,
): ColdChainExposure {
  const continues = journey.connectionMinutes !== null;

  return {
    buildUpHours: context.buildUpHours,
    flightHours: context.flightHours,
    connectionHours: continues
      ? Math.round((journey.connectionMinutes! / 60) * 10) / 10
      : null,
    onwardFlightHours: continues
      ? Math.round(
          (MIN_ONWARD_FLIGHT_HOURS +
            random() * (MAX_ONWARD_FLIGHT_HOURS - MIN_ONWARD_FLIGHT_HOURS)) *
            10,
        ) / 10
      : null,
    ambientC: context.ambientC,
  };
}

function shipmentOf(
  commodity: Commodity,
  grossKg: number,
  random: () => number,
  journey: ShipmentJourney,
  coldChain: ColdChainContext,
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
    journey,
    coldChain: commodity.temperature
      ? assessColdChain(
          commodity.temperature,
          exposureFor(coldChain, journey, random),
        )
      : null,
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
  journeyContext: JourneyContext,
  fixedDestination: string | null | undefined,
  coldChain: ColdChainContext,
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

    const shipment = shipmentOf(
      commodity,
      take,
      random,
      drawJourney(journeyContext, fixedDestination),
      coldChain,
    );
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
  const { targetKg, offered, slots, looseSlots, journey, coldChain, random } =
    request;

  if (targetKg <= 0 || offered.length === 0) {
    return [];
  }

  const units: PlannedUnit[] = [];
  const occupied = request.occupied ?? new Set<string>();
  const compartmentLoad = request.compartmentLoad ?? new Map<number, number>();
  const compartmentShc =
    request.compartmentShc ?? new Map<number, SpecialHandlingCode[]>();
  let budget = Math.round(targetKg);

  for (const slot of slots) {
    if (budget < MIN_UNIT_PAYLOAD_KG) {
      break;
    }

    if (occupied.has(slot.position.designator)) {
      continue;
    }

    const loadedShc = compartmentShc.get(slot.compartment.number) ?? [];
    const admissible = admissibleFor(offered, slot, loadedShc);

    if (admissible.length === 0) {
      continue;
    }

    const commodity = drawCommodity(admissible, random());
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

    const beyondDestination =
      random() < SEALED_UNIT_CHANCE ? drawBeyondPoint(journey) : null;
    const shipments = fillUnit(
      commodity,
      Math.min(capacity.maxGrossKg, headroom),
      capacity.volumeM3,
      budget - spec.tareKg,
      admissible,
      random,
      journey,
      beyondDestination === null ? undefined : beyondDestination,
      coldChain,
    );

    if (shipments.length === 0) {
      continue;
    }

    const grossKg = shipments.reduce(
      (sum, shipment) => sum + shipment.grossKg,
      0,
    );

    budget -= spec.tareKg + grossKg;
    occupied.add(slot.position.designator);
    compartmentLoad.set(slot.compartment.number, used + spec.tareKg + grossKg);
    compartmentShc.set(slot.compartment.number, [
      ...loadedShc,
      ...shipments.flatMap(
        (shipment) => shcOf(shipment.commodityId, offered) ?? [],
      ),
    ]);

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
      beyondDestination,
      sealed: beyondDestination !== null,
      contentClass: LoadContentClass.Cargo,
      bagCount: null,
      priority: false,
      baggageSource: null,
      shipments,
    });
  }

  if (budget >= MIN_BULK_LOT_KG || (budget > 0 && units.length === 0)) {
    units.push(
      ...bulkLots({
        budgetKg: budget,
        offered,
        looseSlots,
        random,
        journey,
        coldChain,
        compartmentLoad,
        compartmentShc,
      }),
    );

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

type BulkLotRequest = {
  budgetKg: number;
  offered: OfferedCommodity[];
  looseSlots: LooseSlot[];
  random: () => number;
  journey: JourneyContext;
  coldChain: ColdChainContext;
  compartmentLoad: Map<number, number>;
  compartmentShc: Map<number, SpecialHandlingCode[]>;
};

export function headroomOf(
  slot: LooseSlot,
  compartmentLoad: Map<number, number>,
): number {
  return (
    slot.compartment.maxWeightKg -
    (compartmentLoad.get(slot.compartment.number) ?? 0)
  );
}

function bulkLots(request: BulkLotRequest): PlannedUnit[] {
  const {
    budgetKg,
    offered,
    looseSlots,
    random,
    journey,
    coldChain,
    compartmentLoad,
    compartmentShc,
  } = request;

  const units: PlannedUnit[] = [];
  let remaining = budgetKg;

  const roomiest = [...looseSlots].sort(
    (one, other) =>
      headroomOf(other, compartmentLoad) - headroomOf(one, compartmentLoad),
  );
  const whole = roomiest.find(
    (slot) => headroomOf(slot, compartmentLoad) >= budgetKg,
  );

  for (const slot of whole ? [whole, ...roomiest] : roomiest) {
    if (remaining <= 0) {
      break;
    }

    const headroom = headroomOf(slot, compartmentLoad);

    if (headroom <= 0) {
      continue;
    }

    const loadedShc = compartmentShc.get(slot.compartment.number) ?? [];
    const admissible = admissibleForCompartment(offered, slot, loadedShc);

    if (admissible.length === 0) {
      continue;
    }

    const commodity = drawCommodity(admissible, random());
    const take = Math.min(remaining, headroom);
    const shipment = shipmentOf(
      commodity,
      take,
      random,
      drawJourney(journey),
      coldChain,
    );

    compartmentLoad.set(
      slot.compartment.number,
      (compartmentLoad.get(slot.compartment.number) ?? 0) + take,
    );
    compartmentShc.set(slot.compartment.number, [
      ...loadedShc,
      ...commodity.shc,
    ]);
    remaining -= take;

    units.push(looseUnit(shipment, take, slot));
  }

  if (remaining > 0) {
    const commodity = drawCommodity(offered, random());

    units.push(
      looseUnit(
        shipmentOf(
          commodity,
          remaining,
          random,
          drawJourney(journey),
          coldChain,
        ),
        remaining,
        null,
      ),
    );
  }

  return units;
}

export function admissibleForCompartment(
  offered: OfferedCommodity[],
  slot: LooseSlot,
  loadedShc: SpecialHandlingCode[],
): OfferedCommodity[] {
  return offered.filter(
    (offer) =>
      compartmentAccepts(offer.commodity, slot.compartment) &&
      mayJoinCompartment(offer.commodity.shc, loadedShc),
  );
}

function looseUnit(
  shipment: PlannedShipment,
  grossKg: number,
  slot: LooseSlot | null,
): PlannedUnit {
  return {
    kind: LoadUnitKind.BulkLot,
    uldType: null,
    positionDesignator: null,
    compartment: slot?.compartment.number ?? null,
    deck: slot?.deck ?? null,
    tareKg: 0,
    grossKg,
    volumeM3: shipment.volumeM3,
    beyondDestination: null,
    sealed: false,
    contentClass: LoadContentClass.Cargo,
    bagCount: null,
    priority: false,
    baggageSource: null,
    shipments: [shipment],
  };
}

export type BaggagePlacementRequest = {
  plan: BaggagePlan;
  slots: PlacementSlot[];
  looseSlots: LooseSlot[];
  occupied: Set<string>;
  compartmentLoad: Map<number, number>;
};

export function compartmentLoadOfUnits(
  units: PlannedUnit[],
): Map<number, number> {
  const load = new Map<number, number>();

  for (const unit of units) {
    if (unit.compartment === null) {
      continue;
    }

    load.set(
      unit.compartment,
      (load.get(unit.compartment) ?? 0) + unit.tareKg + unit.grossKg,
    );
  }

  return load;
}

export function occupiedPositionsOf(units: PlannedUnit[]): Set<string> {
  return new Set(
    units
      .map((unit) => unit.positionDesignator)
      .filter((designator): designator is string => designator !== null),
  );
}

export function planBaggageUnits(
  request: BaggagePlacementRequest,
): PlannedUnit[] {
  const { plan, slots, looseSlots, occupied, compartmentLoad } = request;

  if (plan.bagCount === 0) {
    return [];
  }

  const units: PlannedUnit[] = [];
  let priorityLeft = plan.priorityBagCount;
  let ordinaryLeft = plan.bagCount - plan.priorityBagCount;

  for (const slot of slots) {
    if (priorityLeft + ordinaryLeft === 0) {
      break;
    }

    if (occupied.has(slot.position.designator)) {
      continue;
    }

    const spec = Object.values(ULD_SPECS)
      .filter(
        (candidate) => fits(candidate, slot.position) && !candidate.active,
      )
      .sort((one, other) => other.volumeM3 - one.volumeM3)[0];

    if (!spec) {
      continue;
    }

    const used = compartmentLoad.get(slot.compartment.number) ?? 0;
    const allowanceKg = Math.min(
      spec.maxGrossKg - spec.tareKg,
      slot.position.maxWeightKg - spec.tareKg,
      slot.compartment.maxWeightKg - used - spec.tareKg,
    );
    const capacity = Math.max(
      0,
      Math.min(
        Math.floor(allowanceKg / plan.bagMassKg),
        Math.floor(spec.volumeM3 * BAGS_PER_CUBIC_METRE),
      ),
    );

    if (capacity === 0) {
      continue;
    }

    const priority = priorityLeft > 0;
    const bags = Math.min(capacity, priority ? priorityLeft : ordinaryLeft);

    if (bags === 0) {
      continue;
    }

    if (priority) {
      priorityLeft -= bags;
    } else {
      ordinaryLeft -= bags;
    }

    const grossKg = bags * plan.bagMassKg;

    compartmentLoad.set(slot.compartment.number, used + spec.tareKg + grossKg);
    occupied.add(slot.position.designator);

    units.push({
      kind: LoadUnitKind.Uld,
      uldType: spec.type,
      positionDesignator: slot.position.designator,
      compartment: slot.compartment.number,
      deck: slot.deck,
      tareKg: spec.tareKg,
      grossKg,
      volumeM3: round3(bags / BAGS_PER_CUBIC_METRE),
      beyondDestination: null,
      sealed: false,
      contentClass: LoadContentClass.Baggage,
      bagCount: bags,
      priority,
      baggageSource: plan.source,
      shipments: [],
    });
  }

  for (const [bags, priority] of [
    [priorityLeft, true],
    [ordinaryLeft, false],
  ] as [number, boolean][]) {
    if (bags === 0) {
      continue;
    }

    let left = bags;

    const roomiest = [...looseSlots].sort(
      (one, other) =>
        headroomOf(other, compartmentLoad) - headroomOf(one, compartmentLoad),
    );

    for (const slot of roomiest) {
      if (left === 0) {
        break;
      }

      const fits = Math.floor(
        headroomOf(slot, compartmentLoad) / plan.bagMassKg,
      );

      if (fits <= 0) {
        continue;
      }

      const taken = Math.min(left, fits);

      compartmentLoad.set(
        slot.compartment.number,
        (compartmentLoad.get(slot.compartment.number) ?? 0) +
          taken * plan.bagMassKg,
      );
      left -= taken;

      units.push(baggageLot(taken, priority, plan, slot));
    }

    if (left > 0) {
      units.push(baggageLot(left, priority, plan, null));
    }
  }

  return settleBaggageWeight(units, plan.weightKg);
}

function baggageLot(
  bags: number,
  priority: boolean,
  plan: BaggagePlan,
  slot: LooseSlot | null,
): PlannedUnit {
  return {
    kind: LoadUnitKind.BulkLot,
    uldType: null,
    positionDesignator: null,
    compartment: slot?.compartment.number ?? null,
    deck: slot?.deck ?? null,
    tareKg: 0,
    grossKg: bags * plan.bagMassKg,
    volumeM3: round3(bags / BAGS_PER_CUBIC_METRE),
    beyondDestination: null,
    sealed: false,
    contentClass: LoadContentClass.Baggage,
    bagCount: bags,
    priority,
    baggageSource: plan.source,
    shipments: [],
  };
}

function settleBaggageWeight(
  units: PlannedUnit[],
  weightKg: number,
): PlannedUnit[] {
  if (units.length === 0) {
    return units;
  }

  const assigned = units.reduce((sum, unit) => sum + unit.grossKg, 0);
  const last = units[units.length - 1];

  last.grossKg = Math.max(0, last.grossKg + (weightKg - assigned));

  return units;
}

function shcOf(
  commodityId: string,
  offered: OfferedCommodity[],
): SpecialHandlingCode[] | null {
  return (
    offered.find((offer) => offer.commodity.id === commodityId)?.commodity
      .shc ?? null
  );
}

export function totalCargoKg(units: PlannedUnit[]): number {
  return units.reduce((sum, unit) => sum + unit.tareKg + unit.grossKg, 0);
}
