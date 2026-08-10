import {
  BadRequestError,
  ConflictError,
} from '../../../../core/errors/domain-error';

export class PasswordNotSetError extends ConflictError {
  constructor() {
    super('This account signs in with Google and has no password to change.');
  }
}

export class PasswordAlreadySetError extends ConflictError {
  constructor() {
    super('This account already has a password. Change it instead.');
  }
}

export class CannotUnlinkWithoutPasswordError extends ConflictError {
  constructor() {
    super(
      'Set a password before unlinking your Google account, otherwise you would not be able to sign in.',
    );
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
