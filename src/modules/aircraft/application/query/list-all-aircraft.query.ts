import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../repository/aircraft.repository';
import { CreateAircraftResponse } from '../../dto/create-aircraft.dto';

export class ListAllAircraftQuery extends Query<CreateAircraftResponse[]> {
  constructor() {
    super();
  }
}

@QueryHandler(ListAllAircraftQuery)
export class ListAllAircraftHandler implements IQueryHandler<ListAllAircraftQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(): Promise<CreateAircraftResponse[]> {
    return this.repository.findAll();
  }
}
