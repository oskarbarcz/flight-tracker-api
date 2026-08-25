import {
  CargoContentClass,
  CargoDeck as PrismaCargoDeck,
  CargoTransferRole as PrismaTransferRole,
  CargoUnitKind,
  Prisma,
} from 'prisma/client/client';
import { NewCargoUnit } from '../infra/database/repository/cargo.repository';
import { LoadContentClass, LoadUnitKind, PlannedUnit } from './cargo-packing';
import { awbPrefixFor, generateAwb } from './awb';
import { isRaisedByOperator } from './shipment-journey';
import { generateUldSerial } from './uld';
import { TradeParties } from './trade-party';
import { findCommodityById } from '../data/cargo-commodities';

export type CargoWriteContext = {
  operatorIata: string;
  prefix: string;
  parties: TradeParties;
  carriers: string[];
  random: () => number;
};

export function toNewCargoUnit(
  unit: PlannedUnit,
  context: CargoWriteContext,
): NewCargoUnit {
  const containerised = unit.kind === LoadUnitKind.Uld;

  return {
    kind: containerised ? CargoUnitKind.uld : CargoUnitKind.bulk_lot,
    deck: unit.deck ? (unit.deck as unknown as PrismaCargoDeck) : null,
    compartment: unit.compartment,
    positionDesignator: unit.positionDesignator,
    uldType: unit.uldType,
    uldSerial: containerised ? generateUldSerial(context.random()) : null,
    uldOwner: containerised ? context.operatorIata : null,
    tareKg: unit.tareKg,
    grossKg: unit.grossKg,
    volumeM3: unit.volumeM3,
    contentClass:
      unit.contentClass === LoadContentClass.Baggage
        ? CargoContentClass.baggage
        : CargoContentClass.cargo,
    beyondDestination: unit.beyondDestination,
    sealed: unit.sealed,
    bagCount: unit.bagCount,
    priority: unit.priority,
    baggageSource: unit.baggageSource,
    shipments: unit.shipments.map((shipment) => ({
      commodityId: shipment.commodityId,
      description: shipment.description,
      awb: generateAwb(
        isRaisedByOperator(shipment.journey.transferRole)
          ? context.prefix
          : awbPrefixFor(inboundCarrier(context)),
        context.random(),
      ),
      pieces: shipment.pieces,
      grossKg: shipment.grossKg,
      volumeM3: shipment.volumeM3,
      shc: findCommodityById(shipment.commodityId)?.shc ?? [],
      shipper: context.parties.shipper(),
      consignee: context.parties.consignee(),
      origin: shipment.journey.origin,
      destination: shipment.journey.destination,
      transferRole: shipment.journey
        .transferRole as unknown as PrismaTransferRole,
      onwardCarrier: shipment.journey.onwardCarrier,
      onwardFlightNumber: shipment.journey.onwardFlightNumber,
      connectionMinutes: shipment.journey.connectionMinutes,
      dangerousGoods: dangerousGoodsOf(shipment.commodityId),
      temperatureControl:
        (shipment.coldChain as unknown as Prisma.InputJsonValue) ??
        Prisma.DbNull,
    })),
  };
}

function dangerousGoodsOf(
  commodityId: string,
): Prisma.InputJsonValue | typeof Prisma.DbNull {
  const declaration = findCommodityById(commodityId)?.dangerousGoods;

  return declaration
    ? (declaration as unknown as Prisma.InputJsonValue)
    : Prisma.DbNull;
}

function inboundCarrier(context: CargoWriteContext): string {
  return context.carriers.length === 0
    ? 'ZZ'
    : context.carriers[Math.floor(context.random() * context.carriers.length)];
}
