export const USER_REQUEST_CACHE_PREFIX = 'user:{id}:';

export const CACHE_KEYS = {
  USER_STATS: 'get-my-stats',
  STATS_SUMMARY: 'stats-summary',
  STATS_TYPES: 'stats-aircraft-types',
  STATS_PERIODS: 'stats-periods',
  STATS_ACTIVITY: 'stats-activity',
  USER_ME: 'user-me',
  OPERATORS_LIST: 'operators:list',
  OPERATORS_LIST_RECENT: 'operators:list:recent',
  AIRFRAMES_LIST: 'airframes:list',
  PILOT_CARD: 'pilot-card',
};

export const FLIGHT_CACHE_RESOURCE = {
  ofp: 'ofp',
  delay: 'delay',
  crew: 'crew',
} as const;

export const CACHE_TTL_MS = {
  AIRPORT_OSM_PULL: 3_600_000,
  FLIGHT: 60_000,
  USER_ME: 60_000,
  DELAY: 300_000,
  CREW: 300_000,
  OFP: 86_400_000,
  AIRFRAMES: 86_400_000,
  STATS_ACTIVITY: 60_000,
  OPERATORS_LIST_RECENT: 60_000,
};

export function cacheByUser(key: string, userId: string): string {
  const prefix = USER_REQUEST_CACHE_PREFIX.replace('{id}', userId);
  return `${prefix}${key}`;
}

export function recentOperatorsCacheKey(userId: string): string {
  return cacheByUser(CACHE_KEYS.OPERATORS_LIST_RECENT, userId);
}

export function userStatsCacheKeys(userId: string): string[] {
  return [
    cacheByUser(CACHE_KEYS.USER_STATS, userId),
    cacheByUser(CACHE_KEYS.STATS_SUMMARY, userId),
    cacheByUser(CACHE_KEYS.STATS_TYPES, userId),
  ];
}

export function periodStatsCacheKey(userId: string, utcDay: string): string {
  return `${cacheByUser(CACHE_KEYS.STATS_PERIODS, userId)}:${utcDay}`;
}

function flightScopedCacheKeys(flightId: string, resource?: string): string[] {
  const base = resource
    ? `flight:${flightId}:${resource}`
    : `flight:${flightId}`;
  return [`${base}:auth`, `${base}:anon`];
}

export const flightBodyCacheKeys = (flightId: string): string[] =>
  flightScopedCacheKeys(flightId);

export const flightDelayCacheKeys = (flightId: string): string[] =>
  flightScopedCacheKeys(flightId, FLIGHT_CACHE_RESOURCE.delay);

export const flightCrewCacheKeys = (flightId: string): string[] =>
  flightScopedCacheKeys(flightId, FLIGHT_CACHE_RESOURCE.crew);

/**
 * Where an OpenStreetMap pull is retained between an operations user reviewing it
 * and pushing the parts they accepted. Overpass is a free public service, so the
 * review is served from this rather than re-queried on every reload.
 */
export function airportOsmPullCacheKey(airportId: string): string {
  return `airport:${airportId}:osm-pull`;
}
