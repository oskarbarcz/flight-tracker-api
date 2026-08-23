import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CacheableInterceptor } from './cacheable.interceptor';
import { AuthorizedRequest } from '../http/request/authorized.request';

@Injectable()
export class UserAwareCacheInterceptor extends CacheableInterceptor {
  constructor(cacheManager: any, reflector: Reflector) {
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const baseKey = super.trackBy(context);
    if (!baseKey) return undefined;

    const req = context.switchToHttp().getRequest<AuthorizedRequest>();
    const userId = req.user.sub;
    if (!userId) return undefined;

    return `user:${userId}:${baseKey}`;
  }
}
