import {
  ConflictError,
  NotFoundError,
} from '../../../../core/errors/domain-error';

export class OperatorNotFoundError extends NotFoundError {
  constructor() {
    super('Operator with given ID not found.');
  }
}

export class OperatorWithIcaoCodeNotFoundError extends NotFoundError {
  constructor() {
    super('Operator with given ICAO code not found.');
  }
}

export class OperatorAlreadyExistsError extends ConflictError {
  constructor() {
    super('Operator with given ICAO code already exists.');
  }
}

export class OperatorInUseError extends ConflictError {
  constructor() {
    super('Operator is related to other resources and cannot be removed.');
  }
}
