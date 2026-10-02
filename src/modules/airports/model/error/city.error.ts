import { NotFoundError } from '../../../../core/errors/domain-error';

export class CityNotFoundError extends NotFoundError {
  constructor() {
    super('City with given id does not exist.');
  }
}
