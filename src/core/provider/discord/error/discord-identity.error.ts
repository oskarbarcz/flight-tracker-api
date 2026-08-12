import { BadGatewayError, BadRequestError } from '../../../errors/domain-error';

export class InvalidDiscordAuthorizationCodeError extends BadRequestError {
  constructor() {
    super('Discord authorization code is not valid.');
  }
}

export class DiscordRedirectUriNotAllowedError extends BadRequestError {
  constructor() {
    super('Redirect URI is not allowed.');
  }
}

export class DiscordServerJoinNotAuthorizedError extends BadRequestError {
  constructor() {
    super('Joining the server was not authorized.');
  }
}

export class DiscordUnreachableError extends BadGatewayError {
  constructor() {
    super('Discord is unreachable.');
  }
}
