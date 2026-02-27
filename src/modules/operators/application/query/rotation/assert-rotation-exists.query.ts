import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RotationsRepository } from '../../../infra/database/repository/rotations.repository';
import { RotationNotFoundError } from '../../../model/error/rotation.error';

export class AssertRotationExistsQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(AssertRotationExistsQuery)
export class AssertRotationExistsHandler implements IQueryHandler<AssertRotationExistsQuery> {
  constructor(private readonly repository: RotationsRepository) {}

  async execute(query: AssertRotationExistsQuery): Promise<void> {
    const exists = await this.repository.exists(query.id);

    if (exists) return;

    throw new RotationNotFoundError();
  }
}
