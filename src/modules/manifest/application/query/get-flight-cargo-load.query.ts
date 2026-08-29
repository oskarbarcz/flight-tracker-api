import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { CargoRepository } from '../../infra/database/repository/cargo.repository';
import {
  FlightManifestContext,
  GetFlightManifestContextQuery,
} from '../../../flights/application/query/get-flight-manifest-context.query';
import { CargoManifestNotGeneratedError } from '../../model/error/cargo.error';
import {
  CargoShipmentStatusName,
  FlightCargoManifest,
} from '../../model/cargo-manifest.model';
import {
  AircraftHold,
  GetAircraftHoldQuery,
} from '../../../aircraft/application/query/get-aircraft-hold.query';
import { resolveHoldVariant } from '../../model/hold-variant-resolution';
import { composeFlightCargoManifest } from '../../model/cargo-manifest.read';
import { CargoShipmentStatus } from 'prisma/client/client';

export class GetFlightCargoLoadQuery extends Query<FlightCargoManifest> {
  constructor(
    public readonly flightId: string,
    public readonly status?: CargoShipmentStatusName,
  ) {
    super();
  }
}

@QueryHandler(GetFlightCargoLoadQuery)
export class GetFlightCargoLoadHandler implements IQueryHandler<GetFlightCargoLoadQuery> {
  constructor(
    private readonly cargoRepository: CargoRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: GetFlightCargoLoadQuery): Promise<FlightCargoManifest> {
    const { flightId, status } = query;

    const rows = await this.cargoRepository.findByFlight(
      flightId,
      status as unknown as CargoShipmentStatus | undefined,
    );

    if (rows.length === 0) {
      throw new CargoManifestNotGeneratedError();
    }

    const flight: FlightManifestContext = await this.queryBus.execute(
      new GetFlightManifestContextQuery(flightId),
    );
    const hold: AircraftHold = await this.queryBus.execute(
      new GetAircraftHoldQuery(flight.aircraftId),
    );

    return composeFlightCargoManifest(
      flightId,
      rows,
      resolveHoldVariant(hold.type, hold.holdVariant),
    );
  }
}
