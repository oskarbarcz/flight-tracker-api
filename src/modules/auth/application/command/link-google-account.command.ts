import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infra/database/repository/users.repository';
import { GoogleIdentityClient } from '../../../../core/provider/google/client/google-identity.client';

export class LinkGoogleAccountCommand {
  constructor(
    public readonly userId: string,
    public readonly idToken: string,
  ) {}
}

@CommandHandler(LinkGoogleAccountCommand)
export class LinkGoogleAccountHandler implements ICommandHandler<LinkGoogleAccountCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly googleIdentityClient: GoogleIdentityClient,
  ) {}

  async execute(command: LinkGoogleAccountCommand): Promise<void> {
    const { userId, idToken } = command;
    const identity = await this.googleIdentityClient.verifyIdToken(idToken);

    await this.users.linkGoogleAccount(userId, identity.googleId);
  }
}
