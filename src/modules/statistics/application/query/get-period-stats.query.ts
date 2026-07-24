import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  GetPeriodStatsResponse,
  PeriodComparison,
  PeriodTotals,
} from '../../model/statistics.model';
import { StatisticsRepository } from '../../infra/database/statistics.repository';
import {
  UserStatsByAirport,
  UserStatsByType,
  UserStatsDaily,
} from '../../../../../prisma/client/client';
import {
  currentMonth,
  currentWeek,
  currentYear,
  isWithin,
  Period,
  previousMonth,
  previousWeek,
  previousYear,
} from '../../model/period';

export class GetPeriodStatsQuery extends Query<GetPeriodStatsResponse> {
  constructor(
    public readonly userId: string,
    public readonly now: Date,
  ) {
    super();
  }
}

@QueryHandler(GetPeriodStatsQuery)
export class GetPeriodStatsHandler implements IQueryHandler<GetPeriodStatsQuery> {
  constructor(private readonly repository: StatisticsRepository) {}

  async execute(query: GetPeriodStatsQuery): Promise<GetPeriodStatsResponse> {
    const { userId, now } = query;

    const [daily, byType, byAirport] = await Promise.all([
      this.repository.listDailyBetween(
        userId,
        previousYear(now).start,
        currentYear(now).end,
      ),
      this.repository.listByType(userId),
      this.repository.listByAirport(userId),
    ]);

    return {
      week: this.compare(
        daily,
        byType,
        byAirport,
        currentWeek(now),
        previousWeek(now),
      ),
      month: this.compare(
        daily,
        byType,
        byAirport,
        currentMonth(now),
        previousMonth(now),
      ),
      year: this.compare(
        daily,
        byType,
        byAirport,
        currentYear(now),
        previousYear(now),
      ),
    };
  }

  private compare(
    daily: UserStatsDaily[],
    byType: UserStatsByType[],
    byAirport: UserStatsByAirport[],
    current: Period,
    previous: Period,
  ): PeriodComparison {
    return {
      current: this.sum(daily, current),
      previous: this.sum(daily, previous),
      unlocked: {
        airports: byAirport
          .filter((entry) => isWithin(entry.firstVisitAt as Date, current))
          .map((entry) => entry.icaoCode),
        aircraftTypes: byType
          .filter((entry) => isWithin(entry.firstFlownAt as Date, current))
          .map((entry) => entry.type),
      },
    };
  }

  private sum(daily: UserStatsDaily[], period: Period): PeriodTotals {
    const totals: PeriodTotals = {
      distanceNm: 0,
      airborneMinutes: 0,
      blockMinutes: 0,
      flights: 0,
      fuelBurned: 0,
    };

    for (const row of daily) {
      if (!isWithin(row.day, period)) {
        continue;
      }
      totals.distanceNm += row.distanceNm;
      totals.airborneMinutes += row.airborneMinutes;
      totals.blockMinutes += row.blockMinutes;
      totals.flights += row.flights;
      totals.fuelBurned += row.fuelBurned;
    }

    return totals;
  }
}
