import {
  BadRequestError,
  ConflictError,
} from '../../../../core/errors/domain-error';

export class PasswordNotSetError extends ConflictError {
  constructor() {
    super('This account signs in with Google and has no password to change.');
  }
}

export class NewPasswordMustDifferError extends BadRequestError {
  constructor() {
    super('New password must be different from the current one.');
  }
}

export class InvalidPasswordResetTokenError extends BadRequestError {
  constructor() {
    super('Password reset link is invalid or has expired.');
  }
}
