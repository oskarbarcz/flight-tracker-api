import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { CrewRepository } from '../../../infra/database/repository/crew.repository';
import {
  CrewNotFoundError,
  CrewOperatorMismatchError,
} from '../../../model/error/crew.error';
import { flightCrewCacheKeys } from '../../../../../core/cache/cache.key';

export class AssignCrewMemberToFlightCommand {
  constructor(
    public readonly flightId: string,
    public readonly operatorId: string,
    public readonly crewId: string,
  ) {}
}

@CommandHandler(AssignCrewMemberToFlightCommand)
export class AssignCrewMemberToFlightHandler implements ICommandHandler<AssignCrewMemberToFlightCommand> {
  constructor(
    private readonly crewRepository: CrewRepository,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async execute(command: AssignCrewMemberToFlightCommand): Promise<void> {
    const { flightId, operatorId, crewId } = command;

    const crew = await this.crewRepository.findById(crewId);

    if (!crew) {
      throw new CrewNotFoundError();
    }

    if (crew.operatorId !== operatorId) {
      throw new CrewOperatorMismatchError();
    }

    await this.crewRepository.linkToFlight(flightId, [crewId]);

    await Promise.all(
      flightCrewCacheKeys(flightId).map((key) => this.cacheManager.del(key)),
    );
  }
}
