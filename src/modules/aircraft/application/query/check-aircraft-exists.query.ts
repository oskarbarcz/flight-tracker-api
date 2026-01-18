import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../repository/aircraft.repository';

export class CheckAircraftExistsQuery extends Query<boolean> {
  constructor(public readonly aircraftId: string) {
    super();
  }
}

@QueryHandler(CheckAircraftExistsQuery)
export class CheckAircraftExistsHandler implements IQueryHandler<CheckAircraftExistsQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(query: CheckAircraftExistsQuery): Promise<boolean> {
    return this.repository.exists(query.aircraftId);
  }
}
