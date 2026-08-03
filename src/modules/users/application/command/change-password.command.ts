import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { UserTokenRepository } from '../../infra/database/repository/user-token.repository';
import { UserTokenType } from '../../../../../prisma/client/client';
import { SignOutOtherSessionsCommand } from '../../../auth/application/command/sign-out-other-sessions.command';
import { InvalidCredentialsError } from '../../../auth/model/error/auth.error';
import {
  NewPasswordMustDifferError,
  PasswordNotSetError,
} from '../../model/error/user-password.error';

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
    private readonly tokens: UserTokenRepository,
    private readonly commandBus: CommandBus,
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
    await this.dropPendingEmailChange(userId);
    const signOut = new SignOutOtherSessionsCommand(userId, sessionId);
    await this.commandBus.execute(signOut);
  }

  /**
   * A pending email change was requested by whoever knew the old password, so a
   * password change has to revoke it too — otherwise the confirmation link,
   * which needs no session, still moves the account after the account holder
   * did the one thing the notification email told them to do.
   */
  private async dropPendingEmailChange(userId: string): Promise<void> {
    await this.tokens.deleteAllFor(userId, UserTokenType.email_change);
    await this.users.dropOwnUserCache(userId);
  }
}
