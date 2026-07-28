import { UnauthorizedError } from '../../../errors/domain-error';

export class InvalidGoogleTokenError extends UnauthorizedError {
  constructor() {
    super('Google token is not valid.');
  }
}

export class GoogleEmailNotVerifiedError extends UnauthorizedError {
  constructor() {
    super('Google account email address is not verified.');
  }
}
