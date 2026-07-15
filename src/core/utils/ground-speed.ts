export function firstMovingPosition<T extends { groundSpeed?: number }>(
  path: T[],
  thresholdKnots: number,
): T | null {
  return (
    path.find(
      (position) =>
        position.groundSpeed !== undefined &&
        position.groundSpeed > thresholdKnots,
    ) ?? null
  );
}
