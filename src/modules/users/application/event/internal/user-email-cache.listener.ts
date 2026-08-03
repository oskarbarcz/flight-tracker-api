import { Inject, Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import {
  EmailChangeRequestedEvent,
  UserCredentialsEventType,
} from '../../../../../core/domain/events/dto/user-credentials.events';
import { CACHE_KEYS, cacheByUser } from '../../../../../core/cache/cache.key';

@Injectable()
export class UserEmailCacheListener {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  @OnEvent(UserCredentialsEventType.EmailChangeRequested)
  async onEmailChangeRequested(
    event: EmailChangeRequestedEvent,
  ): Promise<void> {
    await this.cacheManager.del(
      cacheByUser(CACHE_KEYS.USER_ME, event.payload.userId),
    );
  }
}
