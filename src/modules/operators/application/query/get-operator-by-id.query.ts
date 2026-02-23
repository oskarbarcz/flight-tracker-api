import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../infra/database/repository/operators.repository';
import { Operator } from '../../model/operator.model';
import { OperatorNotFoundError } from '../../model/error/operator.error';

export class GetOperatorByIdQuery extends Query<Operator> {
  constructor(public readonly operatorId: string) {
    super();
  }
}

@QueryHandler(GetOperatorByIdQuery)
export class GetOperatorByIdHandler implements IQueryHandler<GetOperatorByIdQuery> {
  constructor(private readonly repository: OperatorsRepository) {}

  async execute(query: GetOperatorByIdQuery): Promise<Operator> {
    const operator = await this.repository.findOneBy({ id: query.operatorId });

    if (!operator) {
      throw new OperatorNotFoundError();
    }

    return operator;
  }
}
