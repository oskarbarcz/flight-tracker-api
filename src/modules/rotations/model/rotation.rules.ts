import { InvalidLegError, RotationChainError } from './error/rotation.error';

export type LegShape = {
  departureId: string;
  arrivalId: string;
  offBlockTime: Date;
  onBlockTime: Date;
};

export function assertLegValid(leg: LegShape): void {
  if (leg.departureId === leg.arrivalId) {
    throw new InvalidLegError(
      'Leg departure and arrival airports must differ.',
    );
  }

  if (leg.offBlockTime.getTime() >= leg.onBlockTime.getTime()) {
    throw new InvalidLegError(
      'Leg off-block time must be earlier than its on-block time.',
    );
  }
}

export function assertChainContinuous(legs: LegShape[]): void {
  const ordered = [...legs].sort(
    (a, b) => a.offBlockTime.getTime() - b.offBlockTime.getTime(),
  );

  for (let index = 1; index < ordered.length; index++) {
    const previous = ordered[index - 1];
    const current = ordered[index];

    if (current.departureId !== previous.arrivalId) {
      throw new RotationChainError(
        'Each leg must depart from the previous leg arrival airport.',
      );
    }

    if (current.offBlockTime.getTime() < previous.onBlockTime.getTime()) {
      throw new RotationChainError('Rotation legs must not overlap in time.');
    }
  }
}
