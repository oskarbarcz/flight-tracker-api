import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { RotationsRepository } from '../../../infra/database/repository/rotations.repository';
import { GetRotationResponse } from '../../../infra/http/request/rotation.request';
import { RotationNotFoundError } from '../../../model/error/rotation.error';

export class GetRotationByIdQuery extends Query<GetRotationResponse> {
  constructor(
    public readonly operatorId: string,
    public readonly rotationId: string,
  ) {
    super();
  }
}

@QueryHandler(GetRotationByIdQuery)
export class GetRotationByIdHandler implements IQueryHandler<GetRotationByIdQuery> {
  constructor(
    private readonly rotationsRepository: RotationsRepository,
    private readonly operatorsRepository: OperatorsRepository,
  ) {}

  async execute(query: GetRotationByIdQuery): Promise<GetRotationResponse> {
    const operatorExists = await this.operatorsRepository.exists(
      query.operatorId,
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    const rotation = await this.rotationsRepository.findOneBy({
      id: query.rotationId,
      operatorId: query.operatorId,
    });

    if (!rotation) {
      throw new RotationNotFoundError();
    }

    return rotation;
  }
}
