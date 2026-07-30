import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infra/database/repository/users.repository';
import { SessionService } from '../../infra/service/session.service';
import {
  InvalidCredentialsError,
  NewPasswordMustDifferError,
  PasswordNotSetError,
} from '../../model/error/auth.error';

export class ChangePasswordCommand {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
    public readonly currentPassword: string,
    public readonly newPassword: string,
  ) {}
}

@CommandHandler(ChangePasswordCommand)
export class ChangePasswordHandler implements ICommandHandler<ChangePasswordCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly sessionService: SessionService,
  ) {}

  async execute(command: ChangePasswordCommand): Promise<void> {
    const { userId, sessionId, currentPassword, newPassword } = command;

    const hasPassword = await this.users.hasPassword(userId);

    if (!hasPassword) {
      throw new PasswordNotSetError();
    }

    const isCurrentPasswordValid = await this.users.verifyPassword(
      userId,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new InvalidCredentialsError();
    }

    if (newPassword === currentPassword) {
      throw new NewPasswordMustDifferError();
    }

    await this.users.setPassword(userId, newPassword);
    await this.sessionService.closeAllForUserExcept(userId, sessionId);
  }
}
