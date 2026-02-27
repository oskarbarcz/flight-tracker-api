import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class CheckUserExistsQuery extends Query<boolean> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(CheckUserExistsQuery)
export class CheckUserExistsHandler implements IQueryHandler<CheckUserExistsQuery> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(query: CheckUserExistsQuery): Promise<boolean> {
    return this.repository.exists(query.userId);
  }
}
