import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { FlightDoesNotExistError } from '../../model/error/flight.error';

export type FlightManifestContext = {
  aircraftId: string;
  cabinLayout: string | null;
  cabinLayoutRevision: number | null;
  captainId: string | null;
};

export class GetFlightManifestContextQuery extends Query<FlightManifestContext> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetFlightManifestContextQuery)
export class GetFlightManifestContextHandler implements IQueryHandler<GetFlightManifestContextQuery> {
  constructor(private readonly flightsRepository: FlightsRepository) {}

  async execute(
    query: GetFlightManifestContextQuery,
  ): Promise<FlightManifestContext> {
    const flight = await this.flightsRepository.getManifestPin(query.flightId);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    return flight;
  }
}
