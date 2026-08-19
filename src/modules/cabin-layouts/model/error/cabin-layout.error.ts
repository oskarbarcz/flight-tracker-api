import { NotFoundError } from '../../../../core/errors/domain-error';

export class CabinLayoutNotFoundError extends NotFoundError {
  constructor(id: string) {
    super(`Cabin layout ${id} does not exist.`);
  }
}
