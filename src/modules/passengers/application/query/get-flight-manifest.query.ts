import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { PassengersRepository } from '../../infra/database/repository/passengers.repository';
import {
  FlightManifestContext,
  GetFlightManifestContextQuery,
} from '../../../flights/application/query/get-flight-manifest-context.query';
import {
  CabinLayoutNotAssignedError,
  ManifestNotGeneratedError,
  ManifestReadableByCaptainOnlyError,
} from '../../model/error/manifest.error';
import {
  FlightManifest,
  ManifestPassenger,
  PassengerStatus,
} from '../../model/manifest.model';
import { CabinDeckName } from '../../../cabin-layouts/model/layout-version';
import { UserRole } from '../../../users/model/user-role';
import { GetAircraftCabinLayoutQuery } from '../../../aircraft/application/query/get-aircraft-cabin-layout.query';

export class GetFlightManifestQuery extends Query<FlightManifest> {
  constructor(
    public readonly flightId: string,
    public readonly actorId: string,
    public readonly actorRole: string,
  ) {
    super();
  }
}

@QueryHandler(GetFlightManifestQuery)
export class GetFlightManifestHandler implements IQueryHandler<GetFlightManifestQuery> {
  constructor(
    private readonly passengersRepository: PassengersRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: GetFlightManifestQuery): Promise<FlightManifest> {
    const { flightId, actorId, actorRole } = query;

    const contextQuery = new GetFlightManifestContextQuery(flightId);
    const flight: FlightManifestContext =
      await this.queryBus.execute(contextQuery);

    if (
      actorRole === UserRole.CabinCrew.toLowerCase() &&
      flight.captainId !== actorId
    ) {
      throw new ManifestReadableByCaptainOnlyError();
    }

    if (!flight.cabinLayout || flight.cabinLayoutRevision === null) {
      await this.assertAircraftHasLayout(flight.aircraftId);

      throw new ManifestNotGeneratedError();
    }

    const rows = await this.passengersRepository.findByFlight(flightId);
    const passengers: ManifestPassenger[] = rows.map((row) => ({
      designator: row.designator,
      deck: row.deck as CabinDeckName,
      cabin: row.cabin,
      name: row.name,
      pnr: row.pnr,
      status: row.status as PassengerStatus,
    }));

    return {
      flightId,
      cabinLayout: flight.cabinLayout,
      cabinLayoutRevision: flight.cabinLayoutRevision,
      passengerCount: passengers.length,
      passengersByCabin: countByCabin(passengers),
      passengers,
    };
  }

  private async assertAircraftHasLayout(aircraftId: string): Promise<void> {
    const layoutQuery = new GetAircraftCabinLayoutQuery(aircraftId);
    const cabinLayout: string | null = await this.queryBus.execute(layoutQuery);

    if (!cabinLayout) {
      throw new CabinLayoutNotAssignedError();
    }
  }
}

function countByCabin(passengers: ManifestPassenger[]): Record<string, number> {
  const counts: Record<string, number> = {};

  for (const passenger of passengers) {
    counts[passenger.cabin] = (counts[passenger.cabin] ?? 0) + 1;
  }

  return counts;
}
