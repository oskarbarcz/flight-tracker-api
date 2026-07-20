import {
  ConflictError,
  NotFoundError,
} from '../../../../core/errors/domain-error';

export class AircraftNotFoundError extends NotFoundError {
  constructor() {
    super('Aircraft with given ID not found.');
  }
}

export class AircraftWithRegistrationNotFoundError extends NotFoundError {
  constructor() {
    super('Aircraft with given registration not found.');
  }
}

export class AircraftWithRegistrationAlreadyExistsError extends ConflictError {
  constructor() {
    super('Aircraft with given registration already exists.');
  }
}

export class AircraftInUseError extends ConflictError {
  constructor() {
    super('Aircraft is related to other resources and cannot be removed.');
  }
}
