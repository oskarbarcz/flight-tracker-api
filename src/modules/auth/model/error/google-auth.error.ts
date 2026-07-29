import { UnauthorizedError } from '../../../../core/errors/domain-error';

export class GoogleAccountNotLinkedError extends UnauthorizedError {
  constructor() {
    super('No user account is linked to this Google account.');
  }
}
