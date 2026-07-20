export const USER_REQUEST_CACHE_PREFIX = 'user:{id}:';

export const CACHE_KEYS = {
  USER_STATS: 'get-my-stats',
  USER_ME: 'user-me',
  OPERATORS_LIST: 'operators:list',
  AIRFRAMES_LIST: 'airframes:list',
  PILOT_CARD: 'pilot-card',
};

export const FLIGHT_CACHE_RESOURCE = {
  ofp: 'ofp',
  delay: 'delay',
  crew: 'crew',
} as const;

export const CACHE_TTL_MS = {
  FLIGHT: 60_000,
  USER_ME: 60_000,
  DELAY: 300_000,
  CREW: 300_000,
  OFP: 86_400_000,
  AIRFRAMES: 86_400_000,
};

export function cacheByUser(key: string, userId: string): string {
  const prefix = USER_REQUEST_CACHE_PREFIX.replace('{id}', userId);
  return `${prefix}${key}`;
}

function flightScopedCacheKeys(flightId: string, resource?: string): string[] {
  const base = resource
    ? `flight:${flightId}:${resource}`
    : `flight:${flightId}`;
  return [`${base}:auth`, `${base}:anon`];
}

export const flightBodyCacheKeys = (flightId: string): string[] =>
  flightScopedCacheKeys(flightId);

export const flightOfpCacheKeys = (flightId: string): string[] =>
  flightScopedCacheKeys(flightId, FLIGHT_CACHE_RESOURCE.ofp);

export const flightDelayCacheKeys = (flightId: string): string[] =>
  flightScopedCacheKeys(flightId, FLIGHT_CACHE_RESOURCE.delay);

export const flightCrewCacheKeys = (flightId: string): string[] =>
  flightScopedCacheKeys(flightId, FLIGHT_CACHE_RESOURCE.crew);
