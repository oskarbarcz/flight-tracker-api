import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetActivityResponse } from '../../model/statistics.model';
import { StatisticsRepository } from '../../infra/database/statistics.repository';
import { startOfUtcDay, utcDayString } from '../../model/period';
import { InvalidActivityRangeError } from '../../model/error/statistics.error';

export class GetActivityQuery extends Query<GetActivityResponse> {
  constructor(
    public readonly userId: string,
    public readonly from: Date,
    public readonly to: Date,
  ) {
    super();
  }
}

@QueryHandler(GetActivityQuery)
export class GetActivityHandler implements IQueryHandler<GetActivityQuery> {
  constructor(private readonly repository: StatisticsRepository) {}

  async execute(query: GetActivityQuery): Promise<GetActivityResponse> {
    const from = startOfUtcDay(query.from);
    const toInclusive = startOfUtcDay(query.to);

    if (from.getTime() > toInclusive.getTime()) {
      throw new InvalidActivityRangeError();
    }

    const toExclusive = new Date(toInclusive);
    toExclusive.setUTCDate(toExclusive.getUTCDate() + 1);

    const rows = await this.repository.listDailyBetween(
      query.userId,
      from,
      toExclusive,
    );

    return {
      days: rows.map((row) => ({
        day: utcDayString(row.day),
        flights: row.flights,
        airborneMinutes: row.airborneMinutes,
        blockMinutes: row.blockMinutes,
      })),
    };
  }
}
