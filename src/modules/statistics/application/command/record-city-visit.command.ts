import { Inject } from '@nestjs/common';
import {
  CommandBus,
  CommandHandler,
  ICommandHandler,
  QueryBus,
} from '@nestjs/cqrs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { v4 } from 'uuid';
import { UserCityVisitRepository } from '../../infra/database/user-city-visit.repository';
import { GetAirportByIdQuery } from '../../../airports/application/query/get-airport-by-id.query';
import { GetAirportResponse } from '../../../airports/infra/http/request/airport.dto';
import { cacheByUser, CACHE_KEYS } from '../../../../core/cache/cache.key';
import { AwardPostcardCommand } from '../../../game/application/command/postcard/award-postcard.command';

export class RecordCityVisitCommand {
  constructor(
    public readonly userId: string,
    public readonly flightId: string,
    public readonly landingAirportId: string,
    public readonly visitedAt: Date,
  ) {}
}

@CommandHandler(RecordCityVisitCommand)
export class RecordCityVisitHandler implements ICommandHandler<RecordCityVisitCommand> {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
    private readonly repository: UserCityVisitRepository,
  ) {}

  async execute(command: RecordCityVisitCommand): Promise<void> {
    const { userId, flightId, landingAirportId, visitedAt } = command;

    const airportQuery = new GetAirportByIdQuery(landingAirportId);
    const airport: GetAirportResponse =
      await this.queryBus.execute(airportQuery);

    await this.repository.record(
      v4(),
      userId,
      airport.city.id,
      flightId,
      landingAirportId,
      visitedAt,
    );

    await this.cacheManager.del(cacheByUser(CACHE_KEYS.STATS_CITIES, userId));

    const visits = await this.repository.countVisitsToCity(
      userId,
      airport.city.id,
    );

    if (visits === 1) {
      const award = new AwardPostcardCommand(
        userId,
        airport.city.id,
        visitedAt,
      );
      await this.commandBus.execute(award);
    }
  }
}
