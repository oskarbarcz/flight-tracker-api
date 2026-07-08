import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { CrewRepository } from '../../../infra/database/repository/crew.repository';
import { Crew } from '../../../model/crew.model';

export class ListFlightCrewQuery extends Query<Crew[]> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(ListFlightCrewQuery)
export class ListFlightCrewQueryHandler implements IQueryHandler<ListFlightCrewQuery> {
  constructor(private readonly crewRepository: CrewRepository) {}

  async execute(query: ListFlightCrewQuery): Promise<Crew[]> {
    return this.crewRepository.findByFlight(query.flightId);
  }
}
