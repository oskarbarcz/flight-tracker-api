import { OnEvent } from '@nestjs/event-emitter';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  FlightEventType,
  FlightWasCreatedEvent,
  PilotCheckedInEvent,
} from '../../../../../core/domain/events/dto/flight.events';
import { recentOperatorsCacheKey } from '../../../../../core/cache/cache.key';

@Injectable()
export class FlightInvolvementListener {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @OnEvent(FlightEventType.FlightWasCreated)
  @OnEvent(FlightEventType.PilotCheckedIn)
  async invalidateRecentList(
    event: FlightWasCreatedEvent | PilotCheckedInEvent,
  ): Promise<void> {
    const { actorId } = event.payload;

    if (!actorId) {
      return;
    }

    await this.cacheManager.del(recentOperatorsCacheKey(actorId));
  }
}
