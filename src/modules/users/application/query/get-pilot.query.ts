import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { FlightPilotDto } from '../../infra/http/request/get-user.dto';

export class GetPilotQuery extends Query<FlightPilotDto | null> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetPilotQuery)
export class GetPilotHandler implements IQueryHandler<GetPilotQuery> {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(query: GetPilotQuery): Promise<FlightPilotDto | null> {
    return this.usersRepository.getPilotCard(query.userId);
  }
}
