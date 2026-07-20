import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  FlightCompletionStats,
  FlightsRepository,
} from '../../infra/database/repository/flights.repository';

export class GetFlightCompletionStatsQuery extends Query<FlightCompletionStats> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetFlightCompletionStatsQuery)
export class GetFlightCompletionStatsHandler implements IQueryHandler<GetFlightCompletionStatsQuery> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(
    query: GetFlightCompletionStatsQuery,
  ): Promise<FlightCompletionStats> {
    return this.repository.getCompletionStats(query.flightId);
  }
}
