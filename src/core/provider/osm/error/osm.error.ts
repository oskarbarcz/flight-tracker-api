import { BadGatewayError, NotFoundError } from '../../../errors/domain-error';

export class AerodromeNotFoundError extends NotFoundError {
  constructor(icaoCode: string) {
    super(`OpenStreetMap holds no aerodrome for ICAO code ${icaoCode}.`);
  }
}

export class OsmProviderUnavailableError extends BadGatewayError {
  constructor() {
    super('OpenStreetMap airport data is unavailable.');
  }
}

export class AirportDataTooLargeError extends BadGatewayError {
  constructor(icaoCode: string) {
    super(
      `OpenStreetMap airport data for ${icaoCode} is too large to be returned in one response.`,
    );
  }
}
