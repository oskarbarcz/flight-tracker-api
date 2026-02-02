import { FlightOfpDetails } from '../../entity/flight.entity';
import { QueryHandler, Query, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../repository/flights.repository';

export class GetOfpByFlightIdQuery extends Query<FlightOfpDetails> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetOfpByFlightIdQuery)
export class GetOfpByFlightIdHandler implements IQueryHandler<GetOfpByFlightIdQuery> {
  constructor(private repository: FlightsRepository) {}

  async execute(query: GetOfpByFlightIdQuery): Promise<FlightOfpDetails> {
    return this.repository.getOfpByFlightId(query.flightId);
  }
}
