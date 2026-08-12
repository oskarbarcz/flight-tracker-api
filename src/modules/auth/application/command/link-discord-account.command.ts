import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infra/database/repository/users.repository';
import { DiscordIdentityClient } from '../../../../core/provider/discord/client/discord-identity.client';
import {
  buildDiscordAvatarUrl,
  GUILDS_JOIN_SCOPE,
  GuildJoinOutcome,
} from '../../../../core/provider/discord/types/discord-identity.types';
import { DiscordServerJoinNotAuthorizedError } from '../../../../core/provider/discord/error/discord-identity.error';
import { LinkDiscordAccountResponse } from '../../infra/http/request/discord-sign-in.dto';

export class LinkDiscordAccountCommand {
  constructor(
    public readonly userId: string,
    public readonly code: string,
    public readonly redirectUri: string,
    public readonly codeVerifier: string,
    public readonly joinServer: boolean,
  ) {}
}

@CommandHandler(LinkDiscordAccountCommand)
export class LinkDiscordAccountHandler implements ICommandHandler<LinkDiscordAccountCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly discordIdentityClient: DiscordIdentityClient,
  ) {}

  async execute(
    command: LinkDiscordAccountCommand,
  ): Promise<LinkDiscordAccountResponse> {
    const { userId, code, redirectUri, codeVerifier, joinServer } = command;

    const authorization = await this.discordIdentityClient.exchangeCode(
      code,
      redirectUri,
      codeVerifier,
    );

    if (joinServer && !authorization.scopes.includes(GUILDS_JOIN_SCOPE)) {
      throw new DiscordServerJoinNotAuthorizedError();
    }

    const identity = await this.discordIdentityClient.getCurrentUser(
      authorization.accessToken,
    );

    await this.users.linkDiscordAccount(userId, identity);

    return {
      linked: true,
      userId: identity.discordId,
      username: identity.username,
      globalName: identity.globalName,
      avatarUrl: buildDiscordAvatarUrl(identity.discordId, identity.avatar),
      joinOutcome: await this.resolveJoinOutcome(
        identity.discordId,
        authorization.accessToken,
        joinServer,
      ),
    };
  }

  private async resolveJoinOutcome(
    discordId: string,
    accessToken: string,
    joinServer: boolean,
  ): Promise<GuildJoinOutcome> {
    if (!joinServer) {
      return 'not_requested';
    }

    return this.discordIdentityClient.addGuildMember(discordId, accessToken);
  }
}
