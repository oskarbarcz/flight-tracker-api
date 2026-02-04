import { FlightTracking } from '../../entity/flight.entity';
import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../repository/flights.repository';

export class GetFlightTrackingQuery extends Query<FlightTracking | undefined> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetFlightTrackingQuery)
export class GetFlightTrackingHandler implements IQueryHandler<GetFlightTrackingQuery> {
  constructor(private repository: FlightsRepository) {}

  async execute(
    query: GetFlightTrackingQuery,
  ): Promise<FlightTracking | undefined> {
    return this.repository.getFlightTracking(query.flightId);
  }
}
