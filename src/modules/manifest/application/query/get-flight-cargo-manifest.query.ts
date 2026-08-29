import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import {
  FlightManifestContext,
  GetFlightManifestContextQuery,
} from '../../../flights/application/query/get-flight-manifest-context.query';
import { CargoManifestReadableByCaptainOnlyError } from '../../model/error/cargo.error';
import {
  CargoShipmentStatusName,
  FlightCargoManifest,
} from '../../model/cargo-manifest.model';
import { UserRole } from '../../../users/model/user-role';
import { GetFlightCargoLoadQuery } from './get-flight-cargo-load.query';

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
  constructor(private readonly queryBus: QueryBus) {}

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

    const load = new GetFlightCargoLoadQuery(flightId, status);

    return this.queryBus.execute(load);
  }
}
