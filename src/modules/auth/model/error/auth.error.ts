import {
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../../../../core/errors/domain-error';
import { JwtTokenType } from '../../infra/http/request/jwt-user.dto';
import { SESSION_CLIENT_NAMES, SessionClient } from '../session-client';

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

export class ClientNotAllowedError extends ForbiddenError {
  constructor(client: SessionClient) {
    super(`This action is not available to ${SESSION_CLIENT_NAMES[client]}.`);
  }
}

export class SessionNotFoundError extends NotFoundError {
  constructor() {
    super('Session does not exist.');
  }
}

export class DeviceAuthorizationNotFoundError extends NotFoundError {
  constructor() {
    super('Device sign-in does not exist or has expired.');
  }
}

export class DeviceAuthorizationDeniedError extends ForbiddenError {
  constructor() {
    super('Device sign-in was declined.');
  }
}
