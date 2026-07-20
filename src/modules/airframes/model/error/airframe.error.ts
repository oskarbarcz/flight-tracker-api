import { NotFoundError } from '../../../../core/errors/domain-error';

export class AirframeNotFoundError extends NotFoundError {
  constructor() {
    super('Airframe with given type not found.');
  }
}
