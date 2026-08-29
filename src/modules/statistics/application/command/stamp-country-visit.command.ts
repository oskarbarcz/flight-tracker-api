import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { v4 } from 'uuid';
import { UserCountryVisitRepository } from '../../infra/database/user-country-visit.repository';
import { GetAirportByIdQuery } from '../../../airports/application/query/get-airport-by-id.query';
import { GetAirportResponse } from '../../../airports/infra/http/request/airport.dto';
import {
  cacheByUser,
  CACHE_KEYS,
  periodStatsCacheKey,
} from '../../../../core/cache/cache.key';
import { utcDayString } from '../../model/period';

export class StampCountryVisitCommand {
  constructor(
    public readonly userId: string,
    public readonly flightId: string,
    public readonly landingAirportId: string,
    public readonly visitedAt: Date,
  ) {}
}

@CommandHandler(StampCountryVisitCommand)
export class StampCountryVisitHandler implements ICommandHandler<StampCountryVisitCommand> {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly queryBus: QueryBus,
    private readonly repository: UserCountryVisitRepository,
  ) {}

  async execute(command: StampCountryVisitCommand): Promise<void> {
    const { userId, flightId, landingAirportId, visitedAt } = command;

    const airportQuery = new GetAirportByIdQuery(landingAirportId);
    const airport: GetAirportResponse =
      await this.queryBus.execute(airportQuery);

    await this.repository.record(
      v4(),
      userId,
      airport.country.code,
      flightId,
      landingAirportId,
      visitedAt,
    );

    await this.bustCaches(userId);
  }

  private async bustCaches(userId: string): Promise<void> {
    const keys = [
      cacheByUser(CACHE_KEYS.STATS_COUNTRIES, userId),
      periodStatsCacheKey(userId, utcDayString(new Date())),
    ];

    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
  }
}
