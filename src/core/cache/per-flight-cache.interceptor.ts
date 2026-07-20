import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CACHE_KEY_METADATA, CacheInterceptor } from '@nestjs/cache-manager';

type CacheableRequest = {
  method: string;
  params?: Record<string, string | undefined>;
  user?: unknown;
};

@Injectable()
export class PerFlightCacheInterceptor extends CacheInterceptor {
  constructor(cacheManager: any, reflector: Reflector) {
    super(cacheManager, reflector);
  }

  trackBy(context: ExecutionContext): string | undefined {
    const request = context.switchToHttp().getRequest<CacheableRequest>();

    if (request.method !== 'GET') {
      return undefined;
    }

    const flightId = request.params?.id ?? request.params?.flightId;
    if (!flightId) {
      return undefined;
    }

    const resource = this.reflector.get<string | undefined>(
      CACHE_KEY_METADATA,
      context.getHandler(),
    );

    const base = resource
      ? `flight:${flightId}:${resource}`
      : `flight:${flightId}`;
    const scope = request.user ? 'auth' : 'anon';

    return `${base}:${scope}`;
  }
}
