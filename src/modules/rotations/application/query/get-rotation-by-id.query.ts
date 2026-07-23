import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import { Rotation } from '../../model/rotation.model';
import { RotationNotFoundError } from '../../model/error/rotation.error';

export class GetRotationByIdQuery extends Query<Rotation> {
  constructor(public readonly rotationId: string) {
    super();
  }
}

@QueryHandler(GetRotationByIdQuery)
export class GetRotationByIdHandler implements IQueryHandler<GetRotationByIdQuery> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(query: GetRotationByIdQuery): Promise<Rotation> {
    const rotation = await this.repository.findById(query.rotationId);

    if (!rotation) {
      throw new RotationNotFoundError();
    }

    return rotation;
  }
}
