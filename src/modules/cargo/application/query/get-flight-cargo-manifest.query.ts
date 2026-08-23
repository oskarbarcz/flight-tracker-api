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
import { LoadUnitKind } from '../../model/cargo-packing';
import { formatUldCode, UldType } from '../../model/uld';
import { UserRole } from '../../../users/model/user-role';
import {
  AircraftHold,
  GetAircraftHoldQuery,
} from '../../../aircraft/application/query/get-aircraft-hold.query';
import { resolveHoldVariant } from '../../model/hold-variant-resolution';
import { CargoShipmentStatus } from 'prisma/client/client';

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
      cargoKg: rows.reduce((sum, row) => sum + row.tareKg + row.grossKg, 0),
      containerCount: rows.filter((row) => row.kind === LoadUnitKind.Uld)
        .length,
      bulkLotCount: rows.filter((row) => row.kind === LoadUnitKind.BulkLot)
        .length,
      shipmentCount: units.reduce(
        (sum, unit) => sum + unit.shipments.length,
        0,
      ),
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
      status: shipment.status as unknown as CargoShipmentStatusName,
    })),
  };
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

    if (existing) {
      existing.weightKg += weightKg;
      continue;
    }

    byCompartment.set(key, {
      compartment: row.compartment,
      deck: row.deck as unknown as CargoDeck,
      weightKg,
    });
  }

  return [...byCompartment.values()].sort(
    (one, other) =>
      one.deck.localeCompare(other.deck) || one.compartment - other.compartment,
  );
}
