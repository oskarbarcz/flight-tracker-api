import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionService } from '../../infra/service/session.service';

export class SignOutEverywhereCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(SignOutEverywhereCommand)
export class SignOutEverywhereHandler implements ICommandHandler<SignOutEverywhereCommand> {
  constructor(private readonly sessionService: SessionService) {}

  async execute(command: SignOutEverywhereCommand): Promise<void> {
    await this.sessionService.closeAllForUser(command.userId);
  }
}
