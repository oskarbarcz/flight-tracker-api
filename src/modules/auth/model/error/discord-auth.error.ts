import { UnauthorizedError } from '../../../../core/errors/domain-error';

export class DiscordAccountNotLinkedError extends UnauthorizedError {
  constructor() {
    super('No user account is linked to this Discord account.');
  }
}
