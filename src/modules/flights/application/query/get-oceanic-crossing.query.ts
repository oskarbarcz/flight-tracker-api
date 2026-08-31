import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { FlightDoesNotExistError } from '../../model/error/flight.error';
import { FlightOceanicCrossing } from '../../model/oceanic.model';

export class GetOceanicCrossingQuery extends Query<FlightOceanicCrossing> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetOceanicCrossingQuery)
export class GetOceanicCrossingHandler implements IQueryHandler<GetOceanicCrossingQuery> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(
    query: GetOceanicCrossingQuery,
  ): Promise<FlightOceanicCrossing> {
    const tracks = await this.repository.findOceanicCrossing(query.flightId);

    if (!tracks) {
      throw new FlightDoesNotExistError();
    }

    return tracks;
  }
}
