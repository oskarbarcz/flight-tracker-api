export const USER_REQUEST_CACHE_PREFIX = 'user:{id}:';

export const CACHE_KEYS = {
  USER_STATS: 'get-my-stats',
};

export function cacheByUser(key: string, userId: string): string {
  const prefix = USER_REQUEST_CACHE_PREFIX.replace('{id}', userId);
  return `${prefix}${key}`;
}
