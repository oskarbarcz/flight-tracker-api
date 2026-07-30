import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetOwnUserDto } from '../../infra/http/request/get-user.dto';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class GetOwnUserQuery extends Query<GetOwnUserDto> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetOwnUserQuery)
export class GetOwnUserHandler implements IQueryHandler<GetOwnUserQuery> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(query: GetOwnUserQuery): Promise<GetOwnUserDto> {
    return this.repository.findOwnById(query.userId);
  }
}
