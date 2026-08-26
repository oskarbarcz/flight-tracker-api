import {
  BadGatewayError,
  ConflictError,
  NotFoundError,
} from '../../../errors/domain-error';

export class SkylinkAirportNotFoundError extends NotFoundError {
  constructor(label: string, code: string) {
    super(`No airport found for ${label} code: ${code}`);
  }
}

export class MultipleSkylinkAirportsFoundError extends ConflictError {
  constructor(label: string, code: string) {
    super(`Multiple airports found for ${label} code: ${code}`);
  }
}

export class SkylinkUnknownCountryError extends BadGatewayError {
  constructor(code: string, country: string) {
    super(
      `SkyLink reported airport ${code} in "${country}", which is not a known ISO 3166-1 alpha-2 country code.`,
    );
  }
}
