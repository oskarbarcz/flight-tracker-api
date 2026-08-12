import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infra/database/repository/users.repository';
import { DiscordGateway } from '../../../../core/provider/discord/gateway/discord.gateway';
import { GuildMembership } from '../../../../core/provider/discord/types/discord-identity.types';

export class GetDiscordServerMembershipQuery extends Query<GuildMembership> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetDiscordServerMembershipQuery)
export class GetDiscordServerMembershipHandler implements IQueryHandler<GetDiscordServerMembershipQuery> {
  constructor(
    private readonly users: UsersRepository,
    private readonly gateway: DiscordGateway,
  ) {}

  async execute(
    query: GetDiscordServerMembershipQuery,
  ): Promise<GuildMembership> {
    const discordId = await this.users.getDiscordId(query.userId);

    if (discordId === null) {
      return 'unknown';
    }

    return this.gateway.findMembership(discordId);
  }
}
