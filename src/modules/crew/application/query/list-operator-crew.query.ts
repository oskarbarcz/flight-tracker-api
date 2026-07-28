import { Query, QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { CrewRepository } from '../../infra/database/repository/crew.repository';
import { AssertOperatorExistsQuery } from '../../../operators/application/assert/assert-operator-exists.query';
import { Crew } from '../../model/crew.model';

export class ListOperatorCrewQuery extends Query<Crew[]> {
  constructor(public readonly operatorId: string) {
    super();
  }
}

@QueryHandler(ListOperatorCrewQuery)
export class ListOperatorCrewQueryHandler implements IQueryHandler<ListOperatorCrewQuery> {
  constructor(
    private readonly crewRepository: CrewRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: ListOperatorCrewQuery): Promise<Crew[]> {
    const operatorQuery = new AssertOperatorExistsQuery(query.operatorId);
    await this.queryBus.execute(operatorQuery);

    return this.crewRepository.findByOperator(query.operatorId);
  }
}
