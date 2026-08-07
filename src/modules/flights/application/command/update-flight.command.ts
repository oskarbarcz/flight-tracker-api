import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { GetFlightQuery } from '../query/get-flight.query';
import { FlightServiceType, FlightStatus } from '../../model/flight.model';
import {
  FlightDoesNotExistError,
  InvalidStatusToChangeServiceTypeError,
} from '../../model/error/flight.error';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { flightBodyCacheKeys } from '../../../../core/cache/cache.key';

export class UpdateFlightCommand {
  constructor(
    public readonly flightId: string,
    public readonly serviceType?: FlightServiceType,
  ) {}
}

@CommandHandler(UpdateFlightCommand)
export class UpdateFlightHandler implements ICommandHandler<UpdateFlightCommand> {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly flightsRepository: FlightsRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(command: UpdateFlightCommand): Promise<void> {
    const { flightId, serviceType } = command;

    const query = new GetFlightQuery(flightId);
    const flight = await this.queryBus.execute(query);

    if (!flight) {
      throw new FlightDoesNotExistError();
    }

    if (serviceType === undefined) {
      return;
    }

    if (flight.status !== FlightStatus.Created) {
      throw new InvalidStatusToChangeServiceTypeError();
    }

    await this.flightsRepository.updateServiceType(flightId, serviceType);

    await Promise.all(
      flightBodyCacheKeys(flightId).map((key) => this.cacheManager.del(key)),
    );
  }
}
