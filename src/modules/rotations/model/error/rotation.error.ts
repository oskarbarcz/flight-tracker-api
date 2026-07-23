import {
  ConflictError,
  NotFoundError,
  UnprocessableError,
} from '../../../../core/errors/domain-error';

export class RotationNotFoundError extends NotFoundError {
  constructor() {
    super('Rotation with given ID not found.');
  }
}

export class RotationLegNotFoundError extends NotFoundError {
  constructor() {
    super('Rotation leg with given ID not found.');
  }
}

export class InvalidLegError extends UnprocessableError {
  constructor(message: string) {
    super(message);
  }
}

export class RotationChainError extends UnprocessableError {
  constructor(message: string) {
    super(message);
  }
}

export class RotationNotReadyableError extends UnprocessableError {
  constructor(message: string) {
    super(message);
  }
}

export class LegSetFrozenError extends ConflictError {
  constructor() {
    super('Legs cannot be added or removed once the rotation is ready.');
  }
}

export class LegAirportsFrozenError extends ConflictError {
  constructor() {
    super('Leg airports cannot be changed once the rotation is ready.');
  }
}

export class LegLockedError extends ConflictError {
  constructor() {
    super('Leg cannot be modified because its flight has already checked in.');
  }
}

export class FlightNotAttachableError extends UnprocessableError {
  constructor(message: string) {
    super(message);
  }
}

export class FlightAlreadyAttachedError extends ConflictError {
  constructor() {
    super('Flight is already attached to a leg.');
  }
}

export class RotationNotActiveError extends ConflictError {
  constructor() {
    super(
      'Flights can only be attached or detached while the rotation is ready or in progress.',
    );
  }
}

export class RotationImmutableError extends ConflictError {
  constructor() {
    super('A finished rotation cannot be modified.');
  }
}
