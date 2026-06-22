import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  GetUserDto,
  ListUsersFilters,
} from '../../infra/http/request/get-user.dto';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class ListUsersQuery extends Query<GetUserDto[]> {
  constructor(public readonly filters: ListUsersFilters) {
    super();
  }
}

@QueryHandler(ListUsersQuery)
export class ListUsersHandler implements IQueryHandler<ListUsersQuery> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(query: ListUsersQuery): Promise<GetUserDto[]> {
    return this.repository.findAll(query.filters);
  }
}
