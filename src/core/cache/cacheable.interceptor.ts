import { CallHandler, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { Observable } from 'rxjs';

export const cacheEnabled = process.env.CACHE_ENABLED !== 'false';

@Injectable()
export class CacheableInterceptor extends CacheInterceptor {
  constructor(cacheManager: any, reflector: Reflector) {
    super(cacheManager, reflector);
  }

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    if (!cacheEnabled) {
      return next.handle();
    }

    return super.intercept(context, next);
  }
}
