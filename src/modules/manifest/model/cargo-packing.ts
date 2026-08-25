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
  TemperatureRegime,
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
import { HoldCannotPlaceLoadError } from './error/cargo.error';

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

export type CompartmentUsage = {
  weightKg: number;
  volumeM3: number;
};

const DENSITY_REDRAWS = 6;

export const MAX_DANGEROUS_GOODS_PER_FLIGHT = 2;

export type DangerousGoodsBudget = { left: number };

export type CargoLoadRequest = {
  targetKg: number;
  offered: OfferedCommodity[];
  slots: PlacementSlot[];
  looseSlots: LooseSlot[];
  journey: JourneyContext;
  coldChain: ColdChainContext;
  random: () => number;
  occupied?: Set<string>;
  compartmentLoad?: Map<number, CompartmentUsage>;
  compartmentShc?: Map<number, SpecialHandlingCode[]>;
  compartmentRegimes?: Map<number, TemperatureRegime[]>;
  dangerousGoodsCeiling?: number | null;
  dangerousGoodsAboard?: number;
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

export function mayJoinCompartmentRegime(
  commodity: Commodity,
  loaded: TemperatureRegime[],
): boolean {
  if (needsActiveContainer(commodity)) {
    return true;
  }

  const regime = commodity.temperature?.regime;

  if (regime === undefined) {
    return true;
  }

  return loaded.every((other) => other === regime);
}

function regimeCarriedBy(commodity: Commodity): TemperatureRegime | null {
  if (needsActiveContainer(commodity)) {
    return null;
  }

  return commodity.temperature?.regime ?? null;
}

function drawable(
  offered: OfferedCommodity[],
  budget: DangerousGoodsBudget,
): OfferedCommodity[] {
  if (budget.left > 0) {
    return offered;
  }

  return offered.filter(
    (offer) => offer.commodity.dangerousGoods === undefined,
  );
}

function spendOn(budget: DangerousGoodsBudget, commodity: Commodity): void {
  if (commodity.dangerousGoods !== undefined) {
    budget.left -= 1;
  }
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
  loadedRegimes: TemperatureRegime[] = [],
): OfferedCommodity[] {
  return offered.filter(
    (offer) =>
      compartmentAccepts(offer.commodity, slot.compartment) &&
      mayJoinCompartment(offer.commodity.shc, loadedShc) &&
      mayJoinCompartmentRegime(offer.commodity, loadedRegimes),
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
  dangerousGoods: DangerousGoodsBudget,
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
    spendOn(dangerousGoods, commodity);
    remainingWeight -= take;
    remainingVolume = round3(remainingVolume - shipment.volumeM3);

    if (remainingWeight < UNIT_FILL_FLOOR_KG || remainingVolume <= 0) {
      break;
    }

    const pool = drawable(offered, dangerousGoods);

    if (pool.length === 0) {
      break;
    }

    const next = drawCommodity(pool, random());
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
  const compartmentLoad =
    request.compartmentLoad ?? new Map<number, CompartmentUsage>();
  const compartmentShc =
    request.compartmentShc ?? new Map<number, SpecialHandlingCode[]>();
  const compartmentRegimes =
    request.compartmentRegimes ?? new Map<number, TemperatureRegime[]>();
  const ceiling = request.dangerousGoodsCeiling;
  const dangerousGoods: DangerousGoodsBudget = {
    left:
      ceiling === undefined || ceiling === null
        ? Number.POSITIVE_INFINITY
        : Math.max(0, ceiling - (request.dangerousGoodsAboard ?? 0)),
  };
  let budget = Math.round(targetKg);

  for (const slot of slots) {
    if (budget < MIN_UNIT_PAYLOAD_KG) {
      break;
    }

    if (occupied.has(slot.position.designator)) {
      continue;
    }

    const loadedShc = compartmentShc.get(slot.compartment.number) ?? [];
    const loadedRegimes = compartmentRegimes.get(slot.compartment.number) ?? [];
    const admissible = drawable(
      admissibleFor(offered, slot, loadedShc, loadedRegimes),
      dangerousGoods,
    );

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

    const used = usageOf(compartmentLoad, slot.compartment.number);
    const headroom = slot.compartment.maxWeightKg - used.weightKg - spec.tareKg;

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
      dangerousGoods,
    );

    if (shipments.length === 0) {
      continue;
    }

    const grossKg = shipments.reduce(
      (sum, shipment) => sum + shipment.grossKg,
      0,
    );

    const volumeM3 = round3(
      shipments.reduce((sum, shipment) => sum + shipment.volumeM3, 0),
    );

    budget -= spec.tareKg + grossKg;
    occupied.add(slot.position.designator);
    addUsage(
      compartmentLoad,
      slot.compartment.number,
      spec.tareKg + grossKg,
      volumeM3,
    );
    compartmentShc.set(slot.compartment.number, [
      ...loadedShc,
      ...shipments.flatMap(
        (shipment) => shcOf(shipment.commodityId, offered) ?? [],
      ),
    ]);
    compartmentRegimes.set(slot.compartment.number, [
      ...loadedRegimes,
      ...shipments.flatMap((shipment) => {
        const carried = regimeOf(shipment.commodityId, offered);
        return carried === null ? [] : [carried];
      }),
    ]);

    units.push({
      kind: LoadUnitKind.Uld,
      uldType: spec.type,
      positionDesignator: slot.position.designator,
      compartment: slot.compartment.number,
      deck: slot.deck,
      tareKg: spec.tareKg,
      grossKg,
      volumeM3,
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
        compartmentRegimes,
        dangerousGoods,
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
  compartmentLoad: Map<number, CompartmentUsage>;
  compartmentShc: Map<number, SpecialHandlingCode[]>;
  compartmentRegimes: Map<number, TemperatureRegime[]>;
  dangerousGoods: DangerousGoodsBudget;
};

export function headroomOf(
  slot: LooseSlot,
  compartmentLoad: Map<number, CompartmentUsage>,
): CompartmentUsage {
  const used = usageOf(compartmentLoad, slot.compartment.number);

  return {
    weightKg: slot.compartment.maxWeightKg - used.weightKg,
    volumeM3: round3(slot.compartment.volumeM3 - used.volumeM3),
  };
}

function takeableKg(headroom: CompartmentUsage, densityKgM3: number): number {
  return Math.floor(
    Math.min(headroom.weightKg, headroom.volumeM3 * densityKgM3),
  );
}

function densestDraw(
  admissible: OfferedCommodity[],
  headroom: CompartmentUsage,
  random: () => number,
): { commodity: Commodity; takeKg: number } | null {
  let best: { commodity: Commodity; takeKg: number } | null = null;

  for (let attempt = 0; attempt < DENSITY_REDRAWS; attempt++) {
    const commodity = drawCommodity(admissible, random());
    const takeKg = takeableKg(headroom, commodity.densityKgM3);

    if (!best || takeKg > best.takeKg) {
      best = { commodity, takeKg };
    }

    if (best.takeKg >= headroom.weightKg) {
      break;
    }
  }

  return best;
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
    compartmentRegimes,
    dangerousGoods,
  } = request;

  const units: PlannedUnit[] = [];
  let remaining = budgetKg;
  let volumeBound = false;

  const roomiest = [...looseSlots].sort(
    (one, other) =>
      headroomOf(other, compartmentLoad).weightKg -
      headroomOf(one, compartmentLoad).weightKg,
  );
  const whole = roomiest.find(
    (slot) => headroomOf(slot, compartmentLoad).weightKg >= budgetKg,
  );

  for (const slot of whole ? [whole, ...roomiest] : roomiest) {
    if (remaining <= 0) {
      break;
    }

    const headroom = headroomOf(slot, compartmentLoad);

    if (headroom.weightKg <= 0 || headroom.volumeM3 <= 0) {
      continue;
    }

    const loadedShc = compartmentShc.get(slot.compartment.number) ?? [];
    const loadedRegimes = compartmentRegimes.get(slot.compartment.number) ?? [];
    const admissible = drawable(
      admissibleForCompartment(offered, slot, loadedShc, loadedRegimes),
      dangerousGoods,
    );

    if (admissible.length === 0) {
      continue;
    }

    const draw = densestDraw(admissible, headroom, random);

    if (!draw) {
      continue;
    }

    const take = Math.min(remaining, draw.takeKg);

    if (take < Math.min(MIN_BULK_LOT_KG, remaining)) {
      volumeBound = volumeBound || headroom.weightKg > take;
      continue;
    }

    const shipment = shipmentOf(
      draw.commodity,
      take,
      random,
      drawJourney(journey),
      coldChain,
    );

    addUsage(compartmentLoad, slot.compartment.number, take, shipment.volumeM3);
    compartmentShc.set(slot.compartment.number, [
      ...loadedShc,
      ...draw.commodity.shc,
    ]);

    const carried = regimeCarriedBy(draw.commodity);

    compartmentRegimes.set(
      slot.compartment.number,
      carried === null ? loadedRegimes : [...loadedRegimes, carried],
    );
    spendOn(dangerousGoods, draw.commodity);
    remaining -= take;

    units.push(looseUnit(shipment, take, slot));
  }

  if (remaining > 0 && looseSlots.length > 0) {
    throw new HoldCannotPlaceLoadError(
      remaining,
      volumeBound ? 'volume' : 'weight',
    );
  }

  if (remaining > 0) {
    const pool = drawable(offered, dangerousGoods);
    const commodity = drawCommodity(pool.length > 0 ? pool : offered, random());

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
  loadedRegimes: TemperatureRegime[] = [],
): OfferedCommodity[] {
  return offered.filter(
    (offer) =>
      compartmentAccepts(offer.commodity, slot.compartment) &&
      mayJoinCompartment(offer.commodity.shc, loadedShc) &&
      mayJoinCompartmentRegime(offer.commodity, loadedRegimes),
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
  compartmentLoad: Map<number, CompartmentUsage>;
};

export function usageOf(
  load: Map<number, CompartmentUsage>,
  compartment: number,
): CompartmentUsage {
  return load.get(compartment) ?? { weightKg: 0, volumeM3: 0 };
}

function addUsage(
  load: Map<number, CompartmentUsage>,
  compartment: number,
  weightKg: number,
  volumeM3: number,
): void {
  const used = usageOf(load, compartment);

  load.set(compartment, {
    weightKg: used.weightKg + weightKg,
    volumeM3: round3(used.volumeM3 + volumeM3),
  });
}

export function compartmentLoadOfUnits(
  units: PlannedUnit[],
): Map<number, CompartmentUsage> {
  const load = new Map<number, CompartmentUsage>();

  for (const unit of units) {
    if (unit.compartment === null) {
      continue;
    }

    addUsage(load, unit.compartment, unit.tareKg + unit.grossKg, unit.volumeM3);
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

    const used = usageOf(compartmentLoad, slot.compartment.number);
    const allowanceKg = Math.min(
      spec.maxGrossKg - spec.tareKg,
      slot.position.maxWeightKg - spec.tareKg,
      slot.compartment.maxWeightKg - used.weightKg - spec.tareKg,
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
    const volumeM3 = round3(bags / BAGS_PER_CUBIC_METRE);

    addUsage(
      compartmentLoad,
      slot.compartment.number,
      spec.tareKg + grossKg,
      volumeM3,
    );
    occupied.add(slot.position.designator);

    units.push({
      kind: LoadUnitKind.Uld,
      uldType: spec.type,
      positionDesignator: slot.position.designator,
      compartment: slot.compartment.number,
      deck: slot.deck,
      tareKg: spec.tareKg,
      grossKg,
      volumeM3,
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
        headroomOf(other, compartmentLoad).weightKg -
        headroomOf(one, compartmentLoad).weightKg,
    );

    for (const slot of roomiest) {
      if (left === 0) {
        break;
      }

      const headroom = headroomOf(slot, compartmentLoad);
      const fits = Math.floor(
        Math.min(
          headroom.weightKg / plan.bagMassKg,
          headroom.volumeM3 * BAGS_PER_CUBIC_METRE,
        ),
      );

      if (fits <= 0) {
        continue;
      }

      const taken = Math.min(left, fits);

      addUsage(
        compartmentLoad,
        slot.compartment.number,
        taken * plan.bagMassKg,
        round3(taken / BAGS_PER_CUBIC_METRE),
      );
      left -= taken;

      units.push(baggageLot(taken, priority, plan, slot));
    }

    if (left > 0 && (slots.length > 0 || looseSlots.length > 0)) {
      throw new HoldCannotPlaceLoadError(left * plan.bagMassKg, 'volume');
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

function regimeOf(
  commodityId: string,
  offered: OfferedCommodity[],
): TemperatureRegime | null {
  const commodity = offered.find(
    (offer) => offer.commodity.id === commodityId,
  )?.commodity;

  return commodity ? regimeCarriedBy(commodity) : null;
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
