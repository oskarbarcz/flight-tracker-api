import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../repository/operators.repository';

export class CheckOperatorExistsQuery extends Query<boolean> {
  constructor(public readonly operatorId: string) {
    super();
  }
}

@QueryHandler(CheckOperatorExistsQuery)
export class CheckOperatorExistsHandler implements IQueryHandler<CheckOperatorExistsQuery> {
  constructor(private readonly repository: OperatorsRepository) {}

  async execute(query: CheckOperatorExistsQuery): Promise<boolean> {
    return this.repository.exists(query.operatorId);
  }
}
