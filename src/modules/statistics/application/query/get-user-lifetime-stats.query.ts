import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetUserStatsResponse } from '../../model/statistics.model';
import { StatisticsRepository } from '../../infra/database/statistics.repository';

export class GetUserLifetimeStatsQuery extends Query<GetUserStatsResponse> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserLifetimeStatsQuery)
export class GetUserLifetimeStatsHandler implements IQueryHandler<GetUserLifetimeStatsQuery> {
  constructor(private readonly repository: StatisticsRepository) {}

  async execute(
    query: GetUserLifetimeStatsQuery,
  ): Promise<GetUserStatsResponse> {
    const total = await this.repository.getTotal(query.userId);

    return {
      total: {
        blockTime: total?.blockMinutes ?? 0,
        totalFlightTime: total?.blockMinutes ?? 0,
        totalFuelBurned: total?.fuelBurned ?? 0,
        totalGreatCircleDistance: total?.distanceNm ?? 0,
      },
    };
  }
}
