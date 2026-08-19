import { BadGatewayError, NotFoundError } from '../../../errors/domain-error';

export class SeatMapNotFoundError extends NotFoundError {
  constructor(slug: string) {
    super(`Seat map for configuration ${slug} does not exist.`);
  }
}

export class AerolopaUnavailableError extends BadGatewayError {
  constructor() {
    super('AeroLOPA is unavailable.');
  }
}

export class SeatMapUnreadableError extends BadGatewayError {
  constructor(slug: string) {
    super(`Seat map payload for configuration ${slug} could not be read.`);
  }
}
