import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infra/database/repository/users.repository';
import { DiscordIdentityClient } from '../../../../core/provider/discord/client/discord-identity.client';
import { SessionService } from '../../infra/service/session.service';
import { SignInResponse } from '../../infra/http/request/sign-in.dto';
import { DiscordAccountNotLinkedError } from '../../model/error/discord-auth.error';

export class SignInWithDiscordCommand {
  constructor(
    public readonly code: string,
    public readonly redirectUri: string,
    public readonly codeVerifier: string,
  ) {}
}

@CommandHandler(SignInWithDiscordCommand)
export class SignInWithDiscordHandler implements ICommandHandler<SignInWithDiscordCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly discordIdentityClient: DiscordIdentityClient,
    private readonly sessionService: SessionService,
  ) {}

  async execute(command: SignInWithDiscordCommand): Promise<SignInResponse> {
    const { code, redirectUri, codeVerifier } = command;

    const authorization = await this.discordIdentityClient.exchangeCode(
      code,
      redirectUri,
      codeVerifier,
    );
    const identity = await this.discordIdentityClient.getCurrentUser(
      authorization.accessToken,
    );
    const user = await this.users.findByDiscordId(identity.discordId);

    if (user === null) {
      throw new DiscordAccountNotLinkedError();
    }

    return this.sessionService.open(user);
  }
}
