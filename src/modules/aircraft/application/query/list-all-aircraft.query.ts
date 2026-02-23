import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../operators/repository/aircraft.repository';
import { LegacyCreateAircraftResponse } from '../../../operators/controller/request/aircraft.request';

export class ListAllAircraftQuery extends Query<
  LegacyCreateAircraftResponse[]
> {
  constructor() {
    super();
  }
}

@QueryHandler(ListAllAircraftQuery)
export class ListAllAircraftHandler implements IQueryHandler<ListAllAircraftQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(): Promise<LegacyCreateAircraftResponse[]> {
    return this.repository.findAll();
  }
}
