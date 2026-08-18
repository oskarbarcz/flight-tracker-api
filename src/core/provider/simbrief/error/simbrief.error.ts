import { BadGatewayError, NotFoundError } from '../../../errors/domain-error';

export class SimbriefUserNotFoundError extends NotFoundError {
  constructor() {
    super('SimBrief account with given ID does not exist.');
  }
}

export class SimbriefUnavailableError extends BadGatewayError {
  constructor() {
    super('SimBrief is unavailable.');
  }
}
