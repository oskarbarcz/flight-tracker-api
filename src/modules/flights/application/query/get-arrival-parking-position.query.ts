import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';

export class GetArrivalParkingPositionQuery extends Query<string | null> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetArrivalParkingPositionQuery)
export class GetArrivalParkingPositionHandler implements IQueryHandler<GetArrivalParkingPositionQuery> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(query: GetArrivalParkingPositionQuery): Promise<string | null> {
    return this.repository.getArrivalParkingPositionId(query.flightId);
  }
}
