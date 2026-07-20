import { NotFoundError } from '../../../../core/errors/domain-error';

export class RotationNotFoundError extends NotFoundError {
  constructor() {
    super('Rotation with given ID not found.');
  }
}
