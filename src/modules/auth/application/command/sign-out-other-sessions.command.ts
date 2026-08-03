import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionService } from '../../infra/service/session.service';

export class SignOutOtherSessionsCommand {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
  ) {}
}

@CommandHandler(SignOutOtherSessionsCommand)
export class SignOutOtherSessionsHandler implements ICommandHandler<SignOutOtherSessionsCommand> {
  constructor(private readonly sessionService: SessionService) {}

  async execute(command: SignOutOtherSessionsCommand): Promise<void> {
    await this.sessionService.closeAllForUserExcept(
      command.userId,
      command.sessionId,
    );
  }
}
