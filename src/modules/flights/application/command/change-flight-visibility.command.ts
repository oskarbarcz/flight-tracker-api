import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightTracking } from '../../model/flight.model';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { FlightDoesNotExistError } from '../../model/error/flight.error';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { flightBodyCacheKeys } from '../../../../core/cache/cache.key';

export class ChangeFlightVisibilityCommand {
  constructor(
    public readonly flightId: string,
    public readonly visibility: FlightTracking,
  ) {}
}

@CommandHandler(ChangeFlightVisibilityCommand)
export class ChangeFlightVisibilityHandler implements ICommandHandler<ChangeFlightVisibilityCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(command: ChangeFlightVisibilityCommand): Promise<void> {
    const { flightId, visibility } = command;
    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    await this.flightsRepository.updateVisibility(flightId, visibility);

    await Promise.all(
      flightBodyCacheKeys(flightId).map((key) => this.cacheManager.del(key)),
    );
  }
}
