import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserTokenType } from '../../../../../prisma/client/client';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { UserTokenRepository } from '../../infra/database/repository/user-token.repository';
import { SignOutEverywhereCommand } from '../../../auth/application/command/sign-out-everywhere.command';
import {
  EmailAlreadyInUseError,
  InvalidEmailChangeTokenError,
} from '../../model/error/user-email.error';

export class ConfirmEmailChangeCommand {
  constructor(public readonly token: string) {}
}

@CommandHandler(ConfirmEmailChangeCommand)
export class ConfirmEmailChangeHandler implements ICommandHandler<ConfirmEmailChangeCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly tokens: UserTokenRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: ConfirmEmailChangeCommand): Promise<void> {
    const token = await this.tokens.findValid(
      UserTokenType.email_change,
      command.token,
    );

    if (!token || !token.newEmail) {
      throw new InvalidEmailChangeTokenError();
    }

    if (await this.users.isEmailTaken(token.newEmail, token.userId)) {
      throw new EmailAlreadyInUseError();
    }

    // Consuming first is what makes the token single-use: a second, concurrent
    // confirmation loses the race here rather than applying the change twice.
    if (!(await this.tokens.consume(token.id))) {
      throw new InvalidEmailChangeTokenError();
    }

    await this.users.setEmail(token.userId, token.newEmail);

    const signOut = new SignOutEverywhereCommand(token.userId);
    await this.commandBus.execute(signOut);
  }
}
