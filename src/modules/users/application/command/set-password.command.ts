import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { SignOutOtherSessionsCommand } from '../../../auth/application/command/sign-out-other-sessions.command';
import { PasswordAlreadySetError } from '../../model/error/user-password.error';

export class SetPasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly newPassword: string,
  ) {}
}

@CommandHandler(SetPasswordCommand)
export class SetPasswordHandler implements ICommandHandler<SetPasswordCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: SetPasswordCommand): Promise<void> {
    const { userId, sessionId, newPassword } = command;

    const hasPassword = await this.users.hasPassword(userId);

    if (hasPassword) {
      throw new PasswordAlreadySetError();
    }

    await this.users.setPassword(userId, newPassword);
    const signOut = new SignOutOtherSessionsCommand(userId, sessionId);
    await this.commandBus.execute(signOut);
  }
}
