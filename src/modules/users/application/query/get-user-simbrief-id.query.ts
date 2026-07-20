import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class GetUserSimbriefIdQuery extends Query<string | null> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserSimbriefIdQuery)
export class GetUserSimbriefIdHandler implements IQueryHandler<GetUserSimbriefIdQuery> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(query: GetUserSimbriefIdQuery): Promise<string | null> {
    return this.repository.getSimbriefUserId(query.userId);
  }
}
