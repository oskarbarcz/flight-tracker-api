import { Query, QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { FlightPilotDto } from '../../infra/http/request/get-user.dto';
import { GetUserLifetimeStatsQuery } from '../../../statistics/application/query/get-user-lifetime-stats.query';

export class GetPilotQuery extends Query<FlightPilotDto | null> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetPilotQuery)
export class GetPilotHandler implements IQueryHandler<GetPilotQuery> {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: GetPilotQuery): Promise<FlightPilotDto | null> {
    const pilot = await this.usersRepository.getPilotCard(query.userId);

    if (!pilot) {
      return null;
    }

    const stats = await this.queryBus.execute(
      new GetUserLifetimeStatsQuery(query.userId),
    );

    return { ...pilot, totalFlightTime: stats.total.totalFlightTime };
  }
}
