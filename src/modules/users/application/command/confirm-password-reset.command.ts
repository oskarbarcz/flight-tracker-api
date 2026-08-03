import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserTokenType } from '../../../../../prisma/client/client';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { UserTokenRepository } from '../../infra/database/repository/user-token.repository';
import { SignOutEverywhereCommand } from '../../../auth/application/command/sign-out-everywhere.command';
import { InvalidPasswordResetTokenError } from '../../model/error/user-password.error';

export class ConfirmPasswordResetCommand {
  constructor(
    public readonly token: string,
    public readonly newPassword: string,
  ) {}
}

@CommandHandler(ConfirmPasswordResetCommand)
export class ConfirmPasswordResetHandler implements ICommandHandler<ConfirmPasswordResetCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly tokens: UserTokenRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: ConfirmPasswordResetCommand): Promise<void> {
    const token = await this.tokens.findValid(
      UserTokenType.password_reset,
      command.token,
    );

    if (!token) {
      throw new InvalidPasswordResetTokenError();
    }

    // Consuming first is what makes the token single-use: a second, concurrent
    // confirmation loses the race here rather than setting a password twice.
    if (!(await this.tokens.consume(token.id))) {
      throw new InvalidPasswordResetTokenError();
    }

    await this.users.setPassword(token.userId, command.newPassword);

    // The pending change was requested with the old credentials, so a reset
    // must revoke it as well — see ChangePasswordHandler.
    await this.tokens.deleteAllFor(token.userId, UserTokenType.email_change);
    await this.users.dropOwnUserCache(token.userId);
    const signOut = new SignOutEverywhereCommand(token.userId);
    await this.commandBus.execute(signOut);
  }
}
