import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class GetUserDiscordIdQuery extends Query<string | null> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserDiscordIdQuery)
export class GetUserDiscordIdHandler implements IQueryHandler<GetUserDiscordIdQuery> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(query: GetUserDiscordIdQuery): Promise<string | null> {
    return this.repository.getDiscordId(query.userId);
  }
}
