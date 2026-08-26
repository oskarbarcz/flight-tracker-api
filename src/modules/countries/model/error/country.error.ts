import { BadRequestError } from '../../../../core/errors/domain-error';

export class UnknownCountryCodeError extends BadRequestError {
  constructor(code: string) {
    super(`"${code}" is not a known ISO 3166-1 alpha-2 country code.`);
  }
}
