import { OffloadPriority } from './commodity.model';

export enum OffloadReason {
  PayloadRestriction = 'payload_restriction',
  SpaceRestriction = 'space_restriction',
}

export type ReconcilableShipment = {
  id: string;
  grossKg: number;
  offloadPriority: OffloadPriority;
};

export type ReconcilableUnit = {
  id: string;
  tareKg: number;
  positionDesignator: string | null;
  shipments: ReconcilableShipment[];
};

export type CargoOffload = {
  shipmentId: string;
  unitId: string;
  reason: OffloadReason;
  offloadedFrom: string | null;
};

export type CargoReconciliationPlan = {
  offloads: CargoOffload[];
  emptiedUnitIds: string[];
  addKg: number;
};

export function mayBeOffloaded(shipment: ReconcilableShipment): boolean {
  return shipment.offloadPriority !== OffloadPriority.Never;
}

export function loadedCargoKg(units: ReconcilableUnit[]): number {
  return units.reduce(
    (sum, unit) =>
      sum +
      unit.tareKg +
      unit.shipments.reduce((total, shipment) => total + shipment.grossKg, 0),
    0,
  );
}

export function retainedCargoKg(units: ReconcilableUnit[]): number {
  return units.reduce((sum, unit) => {
    const retained = unit.shipments.filter(
      (shipment) => !mayBeOffloaded(shipment),
    );

    if (retained.length === 0) {
      return sum;
    }

    return (
      sum +
      unit.tareKg +
      retained.reduce((total, shipment) => total + shipment.grossKg, 0)
    );
  }, 0);
}

export function planCargoReconciliation(
  units: ReconcilableUnit[],
  targetKg: number,
): CargoReconciliationPlan {
  const excess = loadedCargoKg(units) - targetKg;

  if (excess <= 0) {
    return { offloads: [], emptiedUnitIds: [], addKg: Math.max(0, -excess) };
  }

  const unitOf = new Map<string, ReconcilableUnit>();
  const candidates: { shipment: ReconcilableShipment; unitId: string }[] = [];

  for (const unit of units) {
    unitOf.set(unit.id, unit);

    for (const shipment of unit.shipments) {
      if (mayBeOffloaded(shipment)) {
        candidates.push({ shipment, unitId: unit.id });
      }
    }
  }

  candidates.sort(
    (one, other) =>
      one.shipment.offloadPriority - other.shipment.offloadPriority ||
      other.shipment.grossKg - one.shipment.grossKg ||
      one.shipment.id.localeCompare(other.shipment.id),
  );

  const offloaded = new Set<string>();
  const emptied = new Set<string>();
  const offloads: CargoOffload[] = [];
  let removed = 0;

  for (const candidate of candidates) {
    if (removed >= excess) {
      break;
    }

    const unit = unitOf.get(candidate.unitId)!;

    offloaded.add(candidate.shipment.id);
    offloads.push({
      shipmentId: candidate.shipment.id,
      unitId: unit.id,
      reason: OffloadReason.PayloadRestriction,
      offloadedFrom: unit.positionDesignator,
    });
    removed += candidate.shipment.grossKg;

    if (unit.shipments.every((shipment) => offloaded.has(shipment.id))) {
      emptied.add(unit.id);
      removed += unit.tareKg;
    }
  }

  return {
    offloads,
    emptiedUnitIds: [...emptied],
    addKg: Math.max(0, removed - excess),
  };
}
