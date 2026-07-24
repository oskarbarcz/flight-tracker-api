import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  CaptainFlightFact,
  FlightsRepository,
} from '../../infra/database/repository/flights.repository';

export class GetCompletedFlightsByCaptainQuery extends Query<
  CaptainFlightFact[]
> {
  constructor(public readonly captainId: string) {
    super();
  }
}

@QueryHandler(GetCompletedFlightsByCaptainQuery)
export class GetCompletedFlightsByCaptainHandler implements IQueryHandler<GetCompletedFlightsByCaptainQuery> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(
    query: GetCompletedFlightsByCaptainQuery,
  ): Promise<CaptainFlightFact[]> {
    return this.repository.getCompletedFlightsByCaptain(query.captainId);
  }
}
