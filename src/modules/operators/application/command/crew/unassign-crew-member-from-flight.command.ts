import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CrewRepository } from '../../../infra/database/repository/crew.repository';
import { flightCrewCacheKeys } from '../../../../../core/cache/cache.key';

export class UnassignCrewMemberFromFlightCommand {
  constructor(
    public readonly flightId: string,
    public readonly crewId: string,
  ) {}
}

@CommandHandler(UnassignCrewMemberFromFlightCommand)
export class UnassignCrewMemberFromFlightHandler implements ICommandHandler<UnassignCrewMemberFromFlightCommand> {
  constructor(
    private readonly crewRepository: CrewRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(command: UnassignCrewMemberFromFlightCommand): Promise<void> {
    await this.crewRepository.unlinkFromFlight(
      command.flightId,
      command.crewId,
    );

    await Promise.all(
      flightCrewCacheKeys(command.flightId).map((key) =>
        this.cacheManager.del(key),
      ),
    );
  }
}
