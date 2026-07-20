import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../../infra/database/repository/flights.repository';

export class GetLastFlightInRotationQuery extends Query<string | null> {
  constructor(public readonly rotationId: string) {
    super();
  }
}

@QueryHandler(GetLastFlightInRotationQuery)
export class GetLastFlightInRotationHandler implements IQueryHandler<GetLastFlightInRotationQuery> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(query: GetLastFlightInRotationQuery): Promise<string | null> {
    return this.repository.getLastFlightIdInRotation(query.rotationId);
  }
}
