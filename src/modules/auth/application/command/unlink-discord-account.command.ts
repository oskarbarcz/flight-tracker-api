import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infra/database/repository/users.repository';
import { UserHasNoLinkedDiscordAccountError } from '../../../users/model/error/user.error';
import { CannotUnlinkDiscordWithoutPasswordError } from '../../../users/model/error/user-password.error';
import { InvalidCredentialsError } from '../../model/error/auth.error';

export class UnlinkDiscordAccountCommand {
  constructor(
    public readonly userId: string,
    public readonly currentPassword: string,
  ) {}
}

@CommandHandler(UnlinkDiscordAccountCommand)
export class UnlinkDiscordAccountHandler implements ICommandHandler<UnlinkDiscordAccountCommand> {
  constructor(private readonly users: UsersRepository) {}

  async execute(command: UnlinkDiscordAccountCommand): Promise<void> {
    const { userId, currentPassword } = command;

    const hasLinkedDiscordAccount =
      await this.users.hasLinkedDiscordAccount(userId);

    if (!hasLinkedDiscordAccount) {
      throw new UserHasNoLinkedDiscordAccountError();
    }

    const hasPassword = await this.users.hasPassword(userId);

    if (!hasPassword) {
      throw new CannotUnlinkDiscordWithoutPasswordError();
    }

    const isCurrentPasswordValid = await this.users.verifyPassword(
      userId,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new InvalidCredentialsError();
    }

    await this.users.unlinkDiscordAccount(userId);
  }
}
