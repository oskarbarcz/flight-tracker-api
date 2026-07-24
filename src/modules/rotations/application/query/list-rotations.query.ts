import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import { Rotation, RotationStatus } from '../../model/rotation.model';

export class ListRotationsQuery extends Query<Rotation[]> {
  constructor(
    public readonly operatorId: string,
    public readonly status?: RotationStatus,
  ) {
    super();
  }
}

@QueryHandler(ListRotationsQuery)
export class ListRotationsHandler implements IQueryHandler<ListRotationsQuery> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(query: ListRotationsQuery): Promise<Rotation[]> {
    return this.repository.findAll({
      operatorId: query.operatorId,
      status: query.status,
    });
  }
}
