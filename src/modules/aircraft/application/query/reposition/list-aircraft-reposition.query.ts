import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AircraftReposition } from '../../../model/reposition.model';
import { RepositionRepository } from '../../../infra/database/repository/reposition.repository';

export class ListAircraftRepositionQuery extends Query<AircraftReposition[]> {
  constructor(public readonly aircraftId: string) {
    super();
  }
}

@QueryHandler(ListAircraftRepositionQuery)
export class ListAircraftRepositionHandler implements IQueryHandler<ListAircraftRepositionQuery> {
  constructor(private readonly repositionRepository: RepositionRepository) {}

  async execute(
    query: ListAircraftRepositionQuery,
  ): Promise<AircraftReposition[]> {
    return this.repositionRepository.findByAircraft(query.aircraftId);
  }
}
