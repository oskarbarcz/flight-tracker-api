import {
  GetPeriodStatsHandler,
  GetPeriodStatsQuery,
} from './get-period-stats.query';
import { StatisticsRepository } from '../../infra/database/statistics.repository';
import { UserCountryVisitRepository } from '../../infra/database/user-country-visit.repository';

const USER_ID = '3d9f1c26-4b70-4e8a-9c15-7a2e6b0d5f38';
const NOW = new Date('2026-08-20T12:00:00.000Z');

function handlerWith(
  firstVisits: { country: string; firstVisitAt: Date }[],
): GetPeriodStatsHandler {
  const statistics = {
    listDailyBetween: jest.fn().mockResolvedValue([]),
    listByType: jest.fn().mockResolvedValue([]),
    listByAirport: jest.fn().mockResolvedValue([]),
  } as unknown as StatisticsRepository;

  const countryVisits = {
    listFirstVisits: jest.fn().mockResolvedValue(firstVisits),
  } as unknown as UserCountryVisitRepository;

  return new GetPeriodStatsHandler(statistics, countryVisits);
}

describe('countries unlocked in a period', () => {
  it('reports a country entered for the first time within the period', async () => {
    const handler = handlerWith([
      { country: 'FR', firstVisitAt: new Date('2026-08-17T09:40:00.000Z') },
    ]);

    const stats = await handler.execute(new GetPeriodStatsQuery(USER_ID, NOW));

    expect(stats.week.unlocked.countries).toEqual([
      {
        country: { code: 'FR', name: 'France' },
        flag: '🇫🇷',
        firstVisitAt: new Date('2026-08-17T09:40:00.000Z'),
      },
    ]);
  });

  it('does not report a country first entered before the period', async () => {
    const handler = handlerWith([
      { country: 'DE', firstVisitAt: new Date('2024-02-01T10:00:00.000Z') },
    ]);

    const stats = await handler.execute(new GetPeriodStatsQuery(USER_ID, NOW));

    expect(stats.week.unlocked.countries).toEqual([]);
    expect(stats.month.unlocked.countries).toEqual([]);
    expect(stats.year.unlocked.countries).toEqual([]);
  });

  it('reports an empty list for a pilot who unlocked nothing new', async () => {
    const handler = handlerWith([]);

    const stats = await handler.execute(new GetPeriodStatsQuery(USER_ID, NOW));

    expect(stats.week.unlocked.countries).toEqual([]);
  });

  it('reports a country in the wider period that misses the narrower one', async () => {
    const handler = handlerWith([
      { country: 'IS', firstVisitAt: new Date('2026-03-02T08:00:00.000Z') },
    ]);

    const stats = await handler.execute(new GetPeriodStatsQuery(USER_ID, NOW));

    expect(stats.week.unlocked.countries).toEqual([]);
    expect(stats.month.unlocked.countries).toEqual([]);
    expect(stats.year.unlocked.countries).toHaveLength(1);
  });

  it('orders newly unlocked countries by when they were unlocked', async () => {
    const handler = handlerWith([
      { country: 'PL', firstVisitAt: new Date('2026-08-19T06:00:00.000Z') },
      { country: 'FR', firstVisitAt: new Date('2026-08-17T09:40:00.000Z') },
    ]);

    const stats = await handler.execute(new GetPeriodStatsQuery(USER_ID, NOW));

    expect(
      stats.week.unlocked.countries.map((entry) => entry.country.code),
    ).toEqual(['FR', 'PL']);
  });
});
