import { UnauthorizedError } from '../../../../core/errors/domain-error';
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
