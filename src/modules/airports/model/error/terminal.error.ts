import { NotFoundError } from '../../../../core/errors/domain-error';

export class TerminalNotFoundError extends NotFoundError {
  constructor() {
    super('Terminal with given id does not exist.');
  }
}
