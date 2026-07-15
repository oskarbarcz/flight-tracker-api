type Point = { latitude: number; longitude: number };

export function isPointInsidePolygon(point: Point, ring: Point[]): boolean {
  let inside = false;

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i].longitude;
    const yi = ring[i].latitude;
    const xj = ring[j].longitude;
    const yj = ring[j].latitude;

    const straddlesLatitude = yi > point.latitude !== yj > point.latitude;
    const intersectsRay =
      point.longitude < ((xj - xi) * (point.latitude - yi)) / (yj - yi) + xi;

    if (straddlesLatitude && intersectsRay) {
      inside = !inside;
    }
  }

  return inside;
}

export function firstPositionOutsidePerimeter<T extends Point>(
  path: T[],
  perimeter: Point[],
): T | null {
  return (
    path.find((position) => !isPointInsidePolygon(position, perimeter)) ?? null
  );
}
