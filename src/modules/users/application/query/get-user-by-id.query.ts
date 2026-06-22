import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserDto } from '../../infra/http/request/get-user.dto';
import { UsersRepository } from '../../infra/database/repository/users.repository';

export class GetUserByIdQuery extends Query<GetUserDto> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserByIdQuery)
export class GetUserByIdHandler implements IQueryHandler<GetUserByIdQuery> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(query: GetUserByIdQuery): Promise<GetUserDto> {
    return this.repository.findOne(query.userId);
  }
}
