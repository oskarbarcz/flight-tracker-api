import { JwtTokenType } from './jwt-user.dto';
import { UnauthorizedError } from '../../../../../core/errors/domain-error';

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

export class InvalidRefreshTokenError extends UnauthorizedError {
  constructor() {
    super('Refresh token is not valid.');
  }
}
