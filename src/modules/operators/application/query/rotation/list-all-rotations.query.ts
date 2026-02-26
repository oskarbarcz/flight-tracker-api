import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { RotationsRepository } from '../../../infra/database/repository/rotations.repository';
import { GetRotationResponse } from '../../../infra/http/request/rotation.request';

export class ListAllRotationsQuery extends Query<GetRotationResponse[]> {
  constructor(public readonly operatorId: string) {
    super();
  }
}

@QueryHandler(ListAllRotationsQuery)
export class ListAllRotationsQueryHandler implements IQueryHandler<ListAllRotationsQuery> {
  constructor(
    private readonly rotationsRepository: RotationsRepository,
    private readonly operatorsRepository: OperatorsRepository,
  ) {}

  async execute(query: ListAllRotationsQuery): Promise<GetRotationResponse[]> {
    const operatorExists = await this.operatorsRepository.exists(
      query.operatorId,
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    return this.rotationsRepository.findAllForOperator(query.operatorId);
  }
}
