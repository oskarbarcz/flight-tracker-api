const EARTH_RADIUS_NM = 3440.065;

type Coordinates = { latitude: number; longitude: number };

export function haversineDistanceNm(
  from: Coordinates,
  to: Coordinates,
): number {
  const toRad = (degrees: number): number => (degrees * Math.PI) / 180;

  const deltaLat = toRad(to.latitude - from.latitude);
  const deltaLon = toRad(to.longitude - from.longitude);

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(toRad(from.latitude)) *
      Math.cos(toRad(to.latitude)) *
      Math.sin(deltaLon / 2) ** 2;

  return Math.round(EARTH_RADIUS_NM * 2 * Math.asin(Math.min(1, Math.sqrt(a))));
}
