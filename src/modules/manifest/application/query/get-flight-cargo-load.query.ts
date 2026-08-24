import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import {
  FlightManifestContext,
  GetFlightManifestContextQuery,
} from '../../../flights/application/query/get-flight-manifest-context.query';
<<<<<<<< HEAD:src/modules/manifest/application/query/get-flight-cargo-load.query.ts
import { CargoManifestNotGeneratedError } from '../../model/error/cargo.error';
import {
  CargoContentClassName,
========
import { CargoManifestReadableByCaptainOnlyError } from '../../model/error/cargo.error';
import {
>>>>>>>> main:src/modules/cargo/application/query/get-flight-cargo-manifest.query.ts
  CargoShipmentStatusName,
  FlightCargoManifest,
} from '../../model/cargo-manifest.model';
<<<<<<<< HEAD:src/modules/manifest/application/query/get-flight-cargo-load.query.ts
import { CargoDeck } from '../../model/hold-layout.model';
import {
  DangerousGoodsProfile,
  SpecialHandlingCode,
} from '../../model/commodity.model';
import { dryIceKgOf } from '../../model/segregation.policy';
import { ColdChainAssessment, ColdChainRisk } from '../../model/cold-chain';
import { LoadUnitKind } from '../../model/cargo-packing';
import { formatUldCode, UldType } from '../../model/uld';
import {
  AircraftHold,
  GetAircraftHoldQuery,
} from '../../../aircraft/application/query/get-aircraft-hold.query';
import { resolveHoldVariant } from '../../model/hold-variant-resolution';
import { CargoContentClass, CargoShipmentStatus } from 'prisma/client/client';
import { BaggageSource } from '../../model/baggage';
import { isTightConnection, TransferRole } from '../../model/shipment-journey';
import { OffloadReason } from '../../model/cargo-reconciliation';
========
import { UserRole } from '../../../users/model/user-role';
import { GetFlightCargoLoadQuery } from './get-flight-cargo-load.query';
>>>>>>>> main:src/modules/cargo/application/query/get-flight-cargo-manifest.query.ts

export class GetFlightCargoLoadQuery extends Query<FlightCargoManifest> {
  constructor(
    public readonly flightId: string,
    public readonly status?: CargoShipmentStatusName,
  ) {
    super();
  }
}

<<<<<<<< HEAD:src/modules/manifest/application/query/get-flight-cargo-load.query.ts
@QueryHandler(GetFlightCargoLoadQuery)
export class GetFlightCargoLoadHandler implements IQueryHandler<GetFlightCargoLoadQuery> {
  constructor(
    private readonly cargoRepository: CargoRepository,
    private readonly queryBus: QueryBus,
  ) {}
========
@QueryHandler(GetFlightCargoManifestQuery)
export class GetFlightCargoManifestHandler implements IQueryHandler<GetFlightCargoManifestQuery> {
  constructor(private readonly queryBus: QueryBus) {}
>>>>>>>> main:src/modules/cargo/application/query/get-flight-cargo-manifest.query.ts

  async execute(query: GetFlightCargoLoadQuery): Promise<FlightCargoManifest> {
    const { flightId, status } = query;

    const load = new GetFlightCargoLoadQuery(flightId, status);

<<<<<<<< HEAD:src/modules/manifest/application/query/get-flight-cargo-load.query.ts
    if (rows.length === 0) {
      throw new CargoManifestNotGeneratedError();
    }

    const flight: FlightManifestContext = await this.queryBus.execute(
      new GetFlightManifestContextQuery(flightId),
    );
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
========
    return this.queryBus.execute(load);
>>>>>>>> main:src/modules/cargo/application/query/get-flight-cargo-manifest.query.ts
  }
}
