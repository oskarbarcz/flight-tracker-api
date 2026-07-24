import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler, QueryBus } from '@nestjs/cqrs';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { StatisticsRepository } from '../../infra/database/statistics.repository';
import { computeProjections } from '../../model/compute-projections';
import { GetCompletedFlightsByCaptainQuery } from '../../../flights/application/query/get-completed-flights-by-captain.query';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { UserStatisticsChangedEvent } from '../../../../core/domain/events/dto/statistics.event';
import {
  periodStatsCacheKey,
  userStatsCacheKeys,
} from '../../../../core/cache/cache.key';
import { utcDayString } from '../../model/period';

export class RecomputeUserStatisticsCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(RecomputeUserStatisticsCommand)
export class RecomputeUserStatisticsHandler implements ICommandHandler<RecomputeUserStatisticsCommand> {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly queryBus: QueryBus,
    private readonly repository: StatisticsRepository,
    private readonly domainEvents: DomainEventEmitter,
  ) {}

  async execute(command: RecomputeUserStatisticsCommand): Promise<void> {
    const { userId } = command;

    const factsQuery = new GetCompletedFlightsByCaptainQuery(userId);
    const facts = await this.queryBus.execute(factsQuery);

    const projection = computeProjections(facts);
    await this.repository.replaceForUser(userId, projection);

    await this.bustCaches(userId);

    const event = new UserStatisticsChangedEvent({ userId });
    await this.domainEvents.emitAsync(event);
  }

  private async bustCaches(userId: string): Promise<void> {
    const keys = [
      ...userStatsCacheKeys(userId),
      periodStatsCacheKey(userId, utcDayString(new Date())),
    ];

    await Promise.all(keys.map((key) => this.cacheManager.del(key)));
  }
}
