import { ExecutionContext, Injectable } from '@nestjs/common';
import { CacheInterceptor, CacheTTLFactory } from '@nestjs/cache-manager';
import { AuthorizedRequest } from '../http/request/authorized.request';
import { CACHE_TTL_MS, recentOperatorsCacheKey } from './cache.key';

export const RECENT_ONLY_QUERY_PARAM = 'recentOnly';

function queryOf(context: ExecutionContext): Record<string, unknown> {
  const request = context.switchToHttp().getRequest<AuthorizedRequest>();

  return (
    (request as unknown as { query?: Record<string, unknown> }).query ?? {}
  );
}

export function isRecentOperatorListRequest(
  context: ExecutionContext,
): boolean {
  return queryOf(context)[RECENT_ONLY_QUERY_PARAM] === 'true';
}

function isCacheableRequest(context: ExecutionContext): boolean {
  const query = queryOf(context);

  if (Object.keys(query).some((key) => key !== RECENT_ONLY_QUERY_PARAM)) {
    return false;
  }

  const recentOnly = query[RECENT_ONLY_QUERY_PARAM];

  return (
    recentOnly === undefined || recentOnly === 'true' || recentOnly === 'false'
  );
}

export const operatorListCacheTtl = ((context: ExecutionContext) =>
  isRecentOperatorListRequest(context)
    ? CACHE_TTL_MS.OPERATORS_LIST_RECENT
    : undefined) as CacheTTLFactory;

@Injectable()
export class OperatorListCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string | undefined {
    const baseKey = super.trackBy(context) as string | undefined;
    if (!baseKey) return undefined;

    if (!isCacheableRequest(context)) {
      return undefined;
    }

    if (!isRecentOperatorListRequest(context)) {
      return baseKey;
    }

    const request = context.switchToHttp().getRequest<AuthorizedRequest>();
    const userId = request.user?.sub;
    if (!userId) return undefined;

    return recentOperatorsCacheKey(userId);
  }
}
