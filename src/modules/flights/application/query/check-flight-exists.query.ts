import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../repository/flights.repository';

export class CheckFlightExistsQuery extends Query<boolean> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(CheckFlightExistsQuery)
export class CheckFlightExistsHandler implements IQueryHandler<CheckFlightExistsQuery> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(query: CheckFlightExistsQuery): Promise<boolean> {
    return this.repository.exists(query.flightId);
  }
}
