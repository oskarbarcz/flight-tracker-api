import { ExecutionContext, Injectable } from '@nestjs/common';
import { UserAwareCacheInterceptor } from './user-aware-cache.interceptor';

@Injectable()
export class PeriodStatsCacheInterceptor extends UserAwareCacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const baseKey = super.trackBy(context);
    if (!baseKey) return undefined;

    const utcDay = new Date().toISOString().slice(0, 10);
    return `${baseKey}:${utcDay}`;
  }
}
