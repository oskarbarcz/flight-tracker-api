import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import {
  buildDiscordPresence,
  DiscordPresence,
} from '../../model/discord-presence.model';
import { GetFlightQuery } from '../../../flights/application/query/get-flight.query';

export class GetDiscordPresenceQuery extends Query<DiscordPresence | null> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetDiscordPresenceQuery)
export class GetDiscordPresenceHandler implements IQueryHandler<GetDiscordPresenceQuery> {
  constructor(
    private readonly repository: UsersRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    query: GetDiscordPresenceQuery,
  ): Promise<DiscordPresence | null> {
    const settings = await this.repository.getDiscordSettings(query.userId);

    if (!settings.richPresenceEnabled) {
      return null;
    }

    const user = await this.repository.findById(query.userId);

    if (user.currentFlightId === null) {
      return null;
    }

    const flightQuery = new GetFlightQuery(user.currentFlightId);
    const flight = await this.queryBus.execute(flightQuery);

    return buildDiscordPresence(flight);
  }
}
