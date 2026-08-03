import {
  BadRequestError,
  ConflictError,
} from '../../../../core/errors/domain-error';

export class EmailAlreadyInUseError extends ConflictError {
  constructor() {
    super('This email address is already in use.');
  }
}

export class NewEmailMustDifferError extends BadRequestError {
  constructor() {
    super('New email address must be different from the current one.');
  }
}

export class InvalidEmailChangeTokenError extends BadRequestError {
  constructor() {
    super('Email change confirmation link is invalid or has expired.');
  }
}
