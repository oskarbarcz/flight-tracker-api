import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserStatsResponse } from '../../infra/http/request/get-user.dto';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class GetUserStatsQuery extends Query<GetUserStatsResponse> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserStatsQuery)
export class GetUserStatsHandler implements IQueryHandler<GetUserStatsQuery> {
  constructor(private readonly userRepository: UsersRepository) {}

  async execute(query: GetUserStatsQuery): Promise<GetUserStatsResponse> {
    return this.userRepository.getUserStats(query.userId);
  }
}
