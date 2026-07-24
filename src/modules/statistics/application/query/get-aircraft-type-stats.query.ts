import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAircraftTypeStatsResponse } from '../../model/statistics.model';
import { StatisticsRepository } from '../../infra/database/statistics.repository';

export class GetAircraftTypeStatsQuery extends Query<GetAircraftTypeStatsResponse> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetAircraftTypeStatsQuery)
export class GetAircraftTypeStatsHandler implements IQueryHandler<GetAircraftTypeStatsQuery> {
  constructor(private readonly repository: StatisticsRepository) {}

  async execute(
    query: GetAircraftTypeStatsQuery,
  ): Promise<GetAircraftTypeStatsResponse> {
    const rows = await this.repository.listByType(query.userId);

    return {
      types: rows.map((row) => ({
        type: row.type,
        flights: row.flights,
        distanceNm: row.distanceNm,
        airborneMinutes: row.airborneMinutes,
        blockMinutes: row.blockMinutes,
        firstFlownAt: row.firstFlownAt as Date,
        lastFlownAt: row.lastFlownAt as Date,
      })),
    };
  }
}
