import {
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnprocessableError,
} from '../../../../core/errors/domain-error';

export class InvalidStatusToDeclareEmergencyError extends UnprocessableError {
  constructor() {
    super(
      'Emergency can only be declared between off-block and on-block reports.',
    );
  }
}

export class ActiveEmergencyAlreadyExistsError extends ConflictError {
  constructor() {
    super(
      'This flight already has an active emergency. Resolve it before declaring another.',
    );
  }
}

export class EmergencyNotFoundError extends NotFoundError {
  constructor() {
    super('Emergency with given id was not declared for this flight.');
  }
}

export class EmergencyAlreadyResolvedError extends UnprocessableError {
  constructor() {
    super('This emergency has already been resolved.');
  }
}

export class UnresolvedEmergencyCannotCloseFlightError extends BadRequestError {
  constructor() {
    super('Cannot close flight with an unresolved emergency.');
  }
}
