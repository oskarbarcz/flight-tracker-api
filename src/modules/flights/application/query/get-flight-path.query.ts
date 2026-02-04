import { FlightPathElement } from '../../entity/flight.entity';
import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../repository/flights.repository';

export class GetFlightPathQuery extends Query<FlightPathElement[]> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetFlightPathQuery)
export class GetFlightPathHandler implements IQueryHandler<GetFlightPathQuery> {
  constructor(private repository: FlightsRepository) {}

  async execute(query: GetFlightPathQuery): Promise<FlightPathElement[]> {
    return this.repository.getFlightPath(query.flightId);
  }
}
