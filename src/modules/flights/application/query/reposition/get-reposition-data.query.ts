import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  FlightsRepository,
  RepositionFlightData,
} from '../../../infra/database/repository/flights.repository';

export class GetRepositionDataQuery extends Query<RepositionFlightData | null> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetRepositionDataQuery)
export class GetRepositionDataHandler implements IQueryHandler<GetRepositionDataQuery> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(
    query: GetRepositionDataQuery,
  ): Promise<RepositionFlightData | null> {
    return this.repository.getRepositionData(query.flightId);
  }
}
