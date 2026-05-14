import { FlightPathElement } from '../../../model/flight.model';
import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';

export class GetPathQuery extends Query<FlightPathElement[]> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetPathQuery)
export class GetPathHandler implements IQueryHandler<GetPathQuery> {
  constructor(private repository: FlightsRepository) {}

  async execute(query: GetPathQuery): Promise<FlightPathElement[]> {
    return this.repository.getFlightPath(query.flightId);
  }
}
