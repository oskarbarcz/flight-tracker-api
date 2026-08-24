import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import {
  CargoRepository,
  CargoUnitRow,
} from '../../infra/database/repository/cargo.repository';
import {
  FlightManifestContext,
  GetFlightManifestContextQuery,
} from '../../../flights/application/query/get-flight-manifest-context.query';
import {
  CargoManifestNotGeneratedError,
  CargoManifestReadableByCaptainOnlyError,
} from '../../model/error/cargo.error';
import {
  CargoContentClassName,
  CargoShipmentStatusName,
  CargoUnitEntry,
  CompartmentLoad,
  FlightCargoManifest,
} from '../../model/cargo-manifest.model';
import { CargoDeck } from '../../model/hold-layout.model';
import {
  DangerousGoodsProfile,
  SpecialHandlingCode,
} from '../../model/commodity.model';
import { dryIceKgOf } from '../../model/segregation.policy';
import { ColdChainAssessment, ColdChainRisk } from '../../model/cold-chain';
import { LoadUnitKind } from '../../model/cargo-packing';
import { formatUldCode, UldType } from '../../model/uld';
import { UserRole } from '../../../users/model/user-role';
import {
  AircraftHold,
  GetAircraftHoldQuery,
} from '../../../aircraft/application/query/get-aircraft-hold.query';
import { resolveHoldVariant } from '../../model/hold-variant-resolution';
import { CargoContentClass, CargoShipmentStatus } from 'prisma/client/client';
import { BaggageSource } from '../../model/baggage';
import { isTightConnection, TransferRole } from '../../model/shipment-journey';
import { OffloadReason } from '../../model/cargo-reconciliation';

export class GetFlightCargoManifestQuery extends Query<FlightCargoManifest> {
  constructor(
    public readonly flightId: string,
    public readonly actorId: string,
    public readonly actorRole: string,
    public readonly status?: CargoShipmentStatusName,
  ) {
    super();
  }
}

@QueryHandler(GetFlightCargoManifestQuery)
export class GetFlightCargoManifestHandler implements IQueryHandler<GetFlightCargoManifestQuery> {
  constructor(
    private readonly cargoRepository: CargoRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    query: GetFlightCargoManifestQuery,
  ): Promise<FlightCargoManifest> {
    const { flightId, actorId, actorRole, status } = query;

    const flight: FlightManifestContext = await this.queryBus.execute(
      new GetFlightManifestContextQuery(flightId),
    );

    if (
      actorRole === UserRole.CabinCrew.toLowerCase() &&
      flight.captainId !== actorId
    ) {
      throw new CargoManifestReadableByCaptainOnlyError();
    }

    const rows = await this.cargoRepository.findByFlight(
      flightId,
      status as unknown as CargoShipmentStatus | undefined,
    );

    if (rows.length === 0) {
      throw new CargoManifestNotGeneratedError();
    }

    const hold: AircraftHold = await this.queryBus.execute(
      new GetAircraftHoldQuery(flight.aircraftId),
    );
    const variant = resolveHoldVariant(hold.type, hold.holdVariant);
    const units = rows.map(toUnitEntry);

    return {
      flightId,
      holdVariant: variant?.id ?? null,
      cargoKg: rows
        .filter((row) => row.contentClass === CargoContentClass.cargo)
        .reduce((sum, row) => sum + row.tareKg + row.grossKg, 0),
      baggageKg: rows
        .filter((row) => row.contentClass === CargoContentClass.baggage)
        .reduce((sum, row) => sum + row.grossKg, 0),
      bagCount: rows.reduce((sum, row) => sum + (row.bagCount ?? 0), 0),
      baggageSource: baggageSourceOf(rows),
      containerCount: rows.filter(
        (row) =>
          row.kind === LoadUnitKind.Uld &&
          row.contentClass === CargoContentClass.cargo,
      ).length,
      bulkLotCount: rows.filter(
        (row) =>
          row.kind === LoadUnitKind.BulkLot &&
          row.contentClass === CargoContentClass.cargo,
      ).length,
      shipmentCount: units.reduce(
        (sum, unit) => sum + unit.shipments.length,
        0,
      ),
      worstColdChainRisk: worstRiskOf(units),
      dangerousGoodsCount: units
        .flatMap((unit) => unit.shipments)
        .filter((shipment) => shipment.dangerousGoods !== null).length,
      cargoAircraftOnlyCount: units
        .flatMap((unit) => unit.shipments)
        .filter((shipment) => shipment.dangerousGoods?.cargoAircraftOnly)
        .length,
      transferCount: units
        .flatMap((unit) => unit.shipments)
        .filter((shipment) => shipment.onwardCarrier !== null).length,
      tightestConnectionMinutes: tightestConnectionOf(units),
      compartmentLoad: compartmentLoadOf(rows),
      units,
    };
  }
}

function toUnitEntry(row: CargoUnitRow): CargoUnitEntry {
  return {
    kind: row.kind as unknown as LoadUnitKind,
    uldCode:
      row.uldType && row.uldSerial && row.uldOwner
        ? formatUldCode(row.uldType as UldType, row.uldSerial, row.uldOwner)
        : null,
    uldType: (row.uldType as UldType) ?? null,
    positionDesignator: row.positionDesignator,
    compartment: row.compartment,
    deck: (row.deck as unknown as CargoDeck) ?? null,
    tareKg: row.tareKg,
    grossKg: row.grossKg,
    volumeM3: Number(row.volumeM3),
    contentClass: row.contentClass as unknown as CargoContentClassName,
    beyondDestination: row.beyondDestination,
    sealed: row.sealed,
    bagCount: row.bagCount,
    priority: row.priority,
    shipments: row.shipments.map((shipment) => ({
      awb: shipment.awb,
      commodity: shipment.commodityId,
      description: shipment.description,
      pieces: shipment.pieces,
      grossKg: shipment.grossKg,
      volumeM3: Number(shipment.volumeM3),
      shc: shipment.shc,
      shipper: shipment.shipper,
      consignee: shipment.consignee,
      origin: shipment.origin,
      destination: shipment.destination,
      transferRole: shipment.transferRole as unknown as TransferRole,
      onwardCarrier: shipment.onwardCarrier,
      onwardFlightNumber: shipment.onwardFlightNumber,
      connectionMinutes: shipment.connectionMinutes,
      connectionAtRisk: isTightConnection(shipment.connectionMinutes),
      dangerousGoods:
        (shipment.dangerousGoods as DangerousGoodsProfile | null) ?? null,
      coldChain:
        (shipment.temperatureControl as ColdChainAssessment | null) ?? null,
      status: shipment.status as unknown as CargoShipmentStatusName,
      offloadReason:
        (shipment.offloadReason as unknown as OffloadReason) ?? null,
      offloadedFrom: shipment.offloadedFrom,
    })),
  };
}

function baggageSourceOf(rows: CargoUnitRow[]): BaggageSource | null {
  return (
    (rows.find((row) => row.baggageSource !== null)
      ?.baggageSource as BaggageSource) ?? null
  );
}

const RISK_ORDER = [
  ColdChainRisk.Low,
  ColdChainRisk.Elevated,
  ColdChainRisk.High,
];

function worstRiskOf(units: CargoUnitEntry[]): ColdChainRisk | null {
  const risks = units
    .flatMap((unit) => unit.shipments)
    .map((shipment) => shipment.coldChain?.risk)
    .filter((risk): risk is ColdChainRisk => risk !== undefined);

  return risks.length === 0
    ? null
    : risks.reduce((worst, risk) =>
        RISK_ORDER.indexOf(risk) > RISK_ORDER.indexOf(worst) ? risk : worst,
      );
}

function tightestConnectionOf(units: CargoUnitEntry[]): number | null {
  const connections = units
    .flatMap((unit) => unit.shipments)
    .map((shipment) => shipment.connectionMinutes)
    .filter((minutes): minutes is number => minutes !== null);

  return connections.length === 0 ? null : Math.min(...connections);
}

function compartmentLoadOf(rows: CargoUnitRow[]): CompartmentLoad[] {
  const byCompartment = new Map<string, CompartmentLoad>();

  for (const row of rows) {
    if (row.compartment === null || row.deck === null) {
      continue;
    }

    const key = `${row.deck}/${row.compartment}`;
    const existing = byCompartment.get(key);
    const weightKg = row.tareKg + row.grossKg;
    const dryIceKg = row.shipments.reduce(
      (sum, shipment) =>
        sum +
        dryIceKgOf(shipment.shc as SpecialHandlingCode[], shipment.grossKg),
      0,
    );

    if (existing) {
      existing.weightKg += weightKg;
      existing.dryIceKg += dryIceKg;
      continue;
    }

    byCompartment.set(key, {
      compartment: row.compartment,
      deck: row.deck as unknown as CargoDeck,
      weightKg,
      dryIceKg,
    });
  }

  return [...byCompartment.values()].sort(
    (one, other) =>
      one.deck.localeCompare(other.deck) || one.compartment - other.compartment,
  );
}
