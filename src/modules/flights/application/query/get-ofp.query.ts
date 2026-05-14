import { FlightOfpDetails } from '../../model/flight.model';
import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';

export class GetOfpQuery extends Query<FlightOfpDetails> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetOfpQuery)
export class GetOfpHandler implements IQueryHandler<GetOfpQuery> {
  constructor(private repository: FlightsRepository) {}

  async execute(query: GetOfpQuery): Promise<FlightOfpDetails> {
    return this.repository.getOfpByFlightId(query.flightId);
  }
}
