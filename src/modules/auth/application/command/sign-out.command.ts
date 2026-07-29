import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { SessionService } from '../../infra/service/session.service';

export class SignOutCommand {
  constructor(public readonly sessionId: string) {}
}

@CommandHandler(SignOutCommand)
export class SignOutHandler implements ICommandHandler<SignOutCommand> {
  constructor(private readonly sessionService: SessionService) {}

  async execute(command: SignOutCommand): Promise<void> {
    await this.sessionService.close(command.sessionId);
  }
}
