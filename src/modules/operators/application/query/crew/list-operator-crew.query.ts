import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { CrewRepository } from '../../../infra/database/repository/crew.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { Crew } from '../../../model/crew.model';

export class ListOperatorCrewQuery extends Query<Crew[]> {
  constructor(public readonly operatorId: string) {
    super();
  }
}

@QueryHandler(ListOperatorCrewQuery)
export class ListOperatorCrewQueryHandler implements IQueryHandler<ListOperatorCrewQuery> {
  constructor(
    private readonly crewRepository: CrewRepository,
    private readonly operatorsRepository: OperatorsRepository,
  ) {}

  async execute(query: ListOperatorCrewQuery): Promise<Crew[]> {
    const operatorExists = await this.operatorsRepository.exists(
      query.operatorId,
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    return this.crewRepository.findByOperator(query.operatorId);
  }
}
