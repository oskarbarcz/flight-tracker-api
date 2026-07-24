import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../infra/database/repository/rotations.repository';
import { Rotation, RotationStatus } from '../../model/rotation.model';

const ACTIONABLE_STATUSES: RotationStatus[] = Object.values(
  RotationStatus,
).filter((status) => status !== RotationStatus.Draft);

export class ListRotationsForUserQuery extends Query<Rotation[]> {
  constructor(
    public readonly pilotId: string,
    public readonly status?: RotationStatus,
  ) {
    super();
  }
}

@QueryHandler(ListRotationsForUserQuery)
export class ListRotationsForUserHandler implements IQueryHandler<ListRotationsForUserQuery> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(query: ListRotationsForUserQuery): Promise<Rotation[]> {
    const statuses = query.status
      ? ACTIONABLE_STATUSES.filter((status) => status === query.status)
      : ACTIONABLE_STATUSES;

    return this.repository.findAssignedToPilot(query.pilotId, statuses);
  }
}
