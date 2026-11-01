import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../infra/database/repository/session.repository';
import { Session } from '../../model/session.model';

export class ListSessionsQuery {
  constructor(
    public readonly userId: string,
    public readonly currentSessionId: string,
  ) {}
}

@QueryHandler(ListSessionsQuery)
export class ListSessionsHandler implements IQueryHandler<ListSessionsQuery> {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(query: ListSessionsQuery): Promise<Session[]> {
    const sessions = await this.sessions.findActiveForUser(query.userId);

    return sessions.map((session) => ({
      id: session.id,
      client: session.client,
      deviceName: session.deviceName,
      createdAt: session.createdAt,
      lastUsedAt: session.lastUsedAt,
      expiresAt: session.expiresAt,
      current: session.id === query.currentSessionId,
    }));
  }
}
