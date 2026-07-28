import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../infra/database/repository/operators.repository';
import { OperatorNotFoundError } from '../../model/error/operator.error';

export class AssertOperatorExistsQuery {
  constructor(public readonly operatorId: string) {}
}

@QueryHandler(AssertOperatorExistsQuery)
export class AssertOperatorExistsHandler implements IQueryHandler<AssertOperatorExistsQuery> {
  constructor(private readonly repository: OperatorsRepository) {}

  async execute(query: AssertOperatorExistsQuery): Promise<void> {
    const exists = await this.repository.exists(query.operatorId);

    if (exists) return;

    throw new OperatorNotFoundError();
  }
}
