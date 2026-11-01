import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionRepository } from '../../infra/database/repository/session.repository';
import { SessionNotFoundError } from '../../model/error/auth.error';

export class RevokeSessionCommand {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
  ) {}
}

@CommandHandler(RevokeSessionCommand)
export class RevokeSessionHandler implements ICommandHandler<RevokeSessionCommand> {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(command: RevokeSessionCommand): Promise<void> {
    const removed = await this.sessions.removeSessionOfUser(
      command.sessionId,
      command.userId,
    );

    if (removed === 0) {
      throw new SessionNotFoundError();
    }
  }
}
