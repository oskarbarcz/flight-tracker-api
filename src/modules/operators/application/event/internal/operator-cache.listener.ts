import { OnEvent } from '@nestjs/event-emitter';
import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { OperatorEventType } from '../../../../../core/domain/events/dto/operator.event';
import { AircraftEventType } from '../../../../../core/domain/events/dto/aircraft.event';
import { CACHE_KEYS } from '../../../../../core/cache/cache.key';

@Injectable()
export class OperatorCacheListener {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @OnEvent(OperatorEventType.OperatorWasCreated)
  @OnEvent(OperatorEventType.OperatorWasUpdated)
  @OnEvent(OperatorEventType.OperatorWasRemoved)
  @OnEvent(AircraftEventType.AircraftWasCreated)
  @OnEvent(AircraftEventType.AircraftWasEdited)
  @OnEvent(AircraftEventType.AircraftWasRemoved)
  async invalidateList(): Promise<void> {
    await this.cacheManager.del(CACHE_KEYS.OPERATORS_LIST);
  }
}
