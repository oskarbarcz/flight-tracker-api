import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { OperatorDoesNotExistsError } from '../../dto/errors';
import { OperatorsRepository } from '../../repository/operators.repository';
import { Operator } from '../../entity/operator.entity';

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
      throw new NotFoundException(OperatorDoesNotExistsError);
    }

    return operator;
  }
}
