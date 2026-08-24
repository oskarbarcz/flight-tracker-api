import {
  CargoShipmentEntry,
  CargoShipmentStatusName,
  CargoUnitEntry,
  FlightCargoManifest,
} from '../../cargo/model/cargo-manifest.model';
import { LoadUnitKind } from '../../cargo/model/cargo-packing';
import { SpecialHandlingCode } from '../../cargo/model/commodity.model';
import { ULD_SPECS, UldType } from '../../cargo/model/uld';
import { UldBaseCode } from '../../cargo/model/uld-code.model';
import { findCommodityById } from '../../cargo/data/cargo-commodities';
import { drillFor } from './emergency-drill';
import {
  DANGEROUS_GOODS_STATEMENT,
  NO_DANGEROUS_GOODS_STATEMENT,
  NotocColdChain,
  NotocDangerousGoods,
  NotocDocument,
  NotocLoadSummary,
  NotocSpecialLoad,
} from './notoc.model';

export const NOTIFIABLE_HANDLING_CODES: SpecialHandlingCode[] = [
  SpecialHandlingCode.LiveAnimals,
  SpecialHandlingCode.LiveAnimalsHold,
  SpecialHandlingCode.HatchingEggs,
  SpecialHandlingCode.HumanRemains,
  SpecialHandlingCode.LivingOrgans,
  SpecialHandlingCode.Valuable,
  SpecialHandlingCode.Pharmaceuticals,
  SpecialHandlingCode.Heavy,
  SpecialHandlingCode.Outsized,
  SpecialHandlingCode.MunitionsOfWar,
  SpecialHandlingCode.SportingWeapons,
  SpecialHandlingCode.DiplomaticMail,
  SpecialHandlingCode.Wet,
  SpecialHandlingCode.Obnoxious,
];

const SIZED_HANDLING_CODES: SpecialHandlingCode[] = [
  SpecialHandlingCode.Heavy,
  SpecialHandlingCode.Outsized,
];

type PlacedShipment = {
  shipment: CargoShipmentEntry;
  unit: CargoUnitEntry;
};

export function composeNotoc(
  manifest: FlightCargoManifest,
  unloadingAirport: string,
): NotocDocument {
  const placed = loadedShipmentsOf(manifest);
  const dangerousGoods = placed
    .filter(({ shipment }) => shipment.dangerousGoods !== null)
    .map(({ shipment, unit }) =>
      dangerousGoodsEntry(shipment, unit, unloadingAirport),
    )
    .filter((entry): entry is NotocDangerousGoods => entry !== null);

  return {
    statement:
      dangerousGoods.length === 0
        ? NO_DANGEROUS_GOODS_STATEMENT
        : DANGEROUS_GOODS_STATEMENT,
    dangerousGoods,
    specialLoads: placed
      .filter(({ shipment }) => shipment.dangerousGoods === null)
      .map(({ shipment, unit }) =>
        specialLoadEntry(shipment, unit, unloadingAirport),
      )
      .filter((entry): entry is NotocSpecialLoad => entry !== null),
    coldChain: placed
      .map(({ shipment }) => coldChainEntry(shipment))
      .filter((entry): entry is NotocColdChain => entry !== null),
    summary: summaryOf(manifest, placed),
  };
}

function loadedShipmentsOf(manifest: FlightCargoManifest): PlacedShipment[] {
  return manifest.units.flatMap((unit) =>
    unit.shipments
      .filter((shipment) => shipment.status === CargoShipmentStatusName.Loaded)
      .map((shipment) => ({ shipment, unit })),
  );
}

function dangerousGoodsEntry(
  shipment: CargoShipmentEntry,
  unit: CargoUnitEntry,
  unloadingAirport: string,
): NotocDangerousGoods | null {
  const profile = shipment.dangerousGoods;
  const drill = profile ? drillFor(profile.ercCode) : null;

  if (!profile || !drill) {
    return null;
  }

  return {
    awb: shipment.awb,
    properShippingName: profile.properShippingName,
    unNumber: profile.unNumber,
    hazardClass: profile.hazardClass,
    subsidiaryRisk: profile.subsidiaryRisk,
    packingGroup: profile.packingGroup,
    packages: shipment.pieces,
    netPerPackage: profile.netPerPackage,
    position: unit.positionDesignator,
    compartment: unit.compartment,
    unloadingAirport,
    cargoAircraftOnly: profile.cargoAircraftOnly,
    drill,
  };
}

function specialLoadEntry(
  shipment: CargoShipmentEntry,
  unit: CargoUnitEntry,
  unloadingAirport: string,
): NotocSpecialLoad | null {
  const notifiable = shipment.shc.filter((code) =>
    NOTIFIABLE_HANDLING_CODES.includes(code as SpecialHandlingCode),
  );

  if (notifiable.length === 0) {
    return null;
  }

  const sized = notifiable.some((code) =>
    SIZED_HANDLING_CODES.includes(code as SpecialHandlingCode),
  );

  return {
    awb: shipment.awb,
    description: shipment.description,
    shc: notifiable,
    grossKg: shipment.grossKg,
    position: unit.positionDesignator,
    compartment: unit.compartment,
    unloadingAirport,
    heaviestPiece: sized
      ? (findCommodityById(shipment.commodity)?.heaviestPiece ?? null)
      : null,
  };
}

function coldChainEntry(shipment: CargoShipmentEntry): NotocColdChain | null {
  const assessment = shipment.coldChain;

  if (!assessment) {
    return null;
  }

  return {
    awb: shipment.awb,
    description: shipment.description,
    regime: assessment.regime,
    risk: assessment.risk,
    marginHours: assessment.marginHours,
    explanation: assessment.explanation,
    advisory: true,
  };
}

function summaryOf(
  manifest: FlightCargoManifest,
  placed: PlacedShipment[],
): NotocLoadSummary {
  const carrying = manifest.units.filter(
    (unit) => unit.tareKg + unit.grossKg > 0,
  );

  return {
    compartments: manifest.compartmentLoad,
    containerCount: carrying.filter((unit) => baseOf(unit) === UldBaseCode.Ld3)
      .length,
    palletCount: carrying.filter((unit) => {
      const base = baseOf(unit);

      return base === UldBaseCode.Pallet88 || base === UldBaseCode.Pallet96;
    }).length,
    looseLotCount: carrying.filter((unit) => unit.kind === LoadUnitKind.BulkLot)
      .length,
    cargoKg: manifest.cargoKg,
    baggageKg: manifest.baggageKg,
    deadloadKg: manifest.cargoKg + manifest.baggageKg,
    beyondCount: placed.filter(
      ({ shipment }) => shipment.onwardCarrier !== null,
    ).length,
    tightestConnectionMinutes: tightestConnectionOf(placed),
  };
}

function baseOf(unit: CargoUnitEntry): UldBaseCode | null {
  return unit.uldType ? ULD_SPECS[unit.uldType as UldType].base : null;
}

function tightestConnectionOf(placed: PlacedShipment[]): number | null {
  const connections = placed
    .map(({ shipment }) => shipment.connectionMinutes)
    .filter((minutes): minutes is number => minutes !== null);

  return connections.length === 0 ? null : Math.min(...connections);
}
