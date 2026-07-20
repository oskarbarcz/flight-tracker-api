import { NotFoundError } from '../../../../core/errors/domain-error';

export class AirportWeatherNotFoundError extends NotFoundError {
  constructor() {
    super('Weather for given airport does not exist.');
  }
}
