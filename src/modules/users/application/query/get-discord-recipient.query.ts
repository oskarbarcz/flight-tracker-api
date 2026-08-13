import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import {
  DISCORD_NOTIFICATION_SETTING,
  DiscordNotification,
} from '../../model/discord-settings.model';

export class GetDiscordRecipientQuery extends Query<string | null> {
  constructor(
    public readonly userId: string,
    public readonly notification: DiscordNotification,
  ) {
    super();
  }
}

@QueryHandler(GetDiscordRecipientQuery)
export class GetDiscordRecipientHandler implements IQueryHandler<GetDiscordRecipientQuery> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(query: GetDiscordRecipientQuery): Promise<string | null> {
    const settings = await this.repository.getDiscordSettings(query.userId);

    if (!settings[DISCORD_NOTIFICATION_SETTING[query.notification]]) {
      return null;
    }

    return this.repository.getDiscordId(query.userId);
  }
}
