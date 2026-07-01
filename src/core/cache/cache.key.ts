export const USER_REQUEST_CACHE_PREFIX = 'user:{id}:';

export const CACHE_KEYS = {
  USER_STATS: 'get-my-stats',
  OPERATORS_LIST: 'operators:list',
};

export function cacheByUser(key: string, userId: string): string {
  const prefix = USER_REQUEST_CACHE_PREFIX.replace('{id}', userId);
  return `${prefix}${key}`;
}
