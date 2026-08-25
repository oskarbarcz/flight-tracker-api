import {
  ForbiddenError,
  NotFoundError,
  UnprocessableError,
} from '../../../../core/errors/domain-error';

export class SeatCapacityExceededError extends UnprocessableError {
  constructor(passengers: number, seats: number) {
    super(`Cannot seat ${passengers} passengers in a cabin of ${seats} seats.`);
  }
}

export class CabinLayoutNotAssignedError extends NotFoundError {
  constructor() {
    super(
      'Aircraft flying this flight has no cabin layout assigned, so the flight has no manifest.',
    );
  }
}

export class ManifestNotGeneratedError extends NotFoundError {
  constructor() {
    super(
      'Flight has no manifest yet. It is generated when the flight is released to the pilot.',
    );
  }
}

export class ManifestReadableByCaptainOnlyError extends ForbiddenError {
  constructor() {
    super('Cabin crew can only read the manifest of a flight they captain.');
  }
}

export class UnknownCabinError extends UnprocessableError {
  constructor(cabin: string) {
    super(`Cabin "${cabin}" does not exist in the cabin of this flight.`);
  }
}

export class CabinCapacityExceededError extends UnprocessableError {
  constructor(cabin: string, passengers: number, seats: number) {
    super(
      `Cannot seat ${passengers} passengers in cabin "${cabin}", which has ${seats} seats.`,
    );
  }
}
