import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../operators/infra/database/repository/aircraft.repository';
import { LegacyCreateAircraftResponse } from '../../../operators/infra/http/request/aircraft.request';

export class LegacyListAllAircraftQuery extends Query<
  LegacyCreateAircraftResponse[]
> {
  constructor() {
    super();
  }
}

@QueryHandler(LegacyListAllAircraftQuery)
export class LegacyListAllAircraftHandler implements IQueryHandler<LegacyListAllAircraftQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(): Promise<LegacyCreateAircraftResponse[]> {
    return this.repository.findAll();
  }
}
