import {
  BadRequestError,
  ConflictError,
  UnauthorizedError,
} from '../../../../core/errors/domain-error';
import { JwtTokenType } from '../../infra/http/request/jwt-user.dto';

export class CannotUseTokenTypeError extends UnauthorizedError {
  constructor(type: JwtTokenType) {
    super(`Cannot use ${type} token for this request.`);
  }
}

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Credentials are incorrect.');
  }
}

export class SessionNoLongerValidError extends UnauthorizedError {
  constructor() {
    super('Session is no longer valid.');
  }
}

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
