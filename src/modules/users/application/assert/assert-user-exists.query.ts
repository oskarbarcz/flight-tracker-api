import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UserNotFoundError } from '../../model/error/user.error';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class AssertUserExistsQuery {
  constructor(public readonly userId: string) {}
}

@QueryHandler(AssertUserExistsQuery)
export class AssertUserExistsHandler implements IQueryHandler<AssertUserExistsQuery> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(query: AssertUserExistsQuery): Promise<void> {
    const exists = await this.repository.exists(query.userId);

    if (exists) return;

    throw new UserNotFoundError();
  }
}
