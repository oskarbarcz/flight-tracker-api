import { isPointInsidePolygon } from './perimeter';

type Point = { latitude: number; longitude: number };

export function firstArrivalPosition<
  T extends Point & { groundSpeed?: number },
>(path: T[], perimeter: Point[], maxGroundSpeedKnots: number): T | null {
  return (
    path.find(
      (position) =>
        position.groundSpeed !== undefined &&
        position.groundSpeed < maxGroundSpeedKnots &&
        isPointInsidePolygon(position, perimeter),
    ) ?? null
  );
}
