import { NotFoundError } from '../../../../core/errors/domain-error';

export class GateNotFoundError extends NotFoundError {
  constructor() {
    super('Gate with given id does not exist.');
  }
}
