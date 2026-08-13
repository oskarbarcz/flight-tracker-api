import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { DiscordSettings } from '../../model/discord-settings.model';

export class GetUserDiscordSettingsQuery extends Query<DiscordSettings> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserDiscordSettingsQuery)
export class GetUserDiscordSettingsHandler implements IQueryHandler<GetUserDiscordSettingsQuery> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(query: GetUserDiscordSettingsQuery): Promise<DiscordSettings> {
    return this.repository.getDiscordSettings(query.userId);
  }
}
