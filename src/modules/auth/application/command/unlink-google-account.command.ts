import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infra/database/repository/users.repository';
import { UserHasNoLinkedGoogleAccountError } from '../../../users/model/error/user.error';
import { CannotUnlinkWithoutPasswordError } from '../../../users/model/error/user-password.error';
import { InvalidCredentialsError } from '../../model/error/auth.error';

export class UnlinkGoogleAccountCommand {
  constructor(
    public readonly userId: string,
    public readonly currentPassword: string,
  ) {}
}

@CommandHandler(UnlinkGoogleAccountCommand)
export class UnlinkGoogleAccountHandler implements ICommandHandler<UnlinkGoogleAccountCommand> {
  constructor(private readonly users: UsersRepository) {}

  async execute(command: UnlinkGoogleAccountCommand): Promise<void> {
    const { userId, currentPassword } = command;

    const hasLinkedGoogleAccount =
      await this.users.hasLinkedGoogleAccount(userId);

    if (!hasLinkedGoogleAccount) {
      throw new UserHasNoLinkedGoogleAccountError();
    }

    const hasPassword = await this.users.hasPassword(userId);

    if (!hasPassword) {
      throw new CannotUnlinkWithoutPasswordError();
    }

    const isCurrentPasswordValid = await this.users.verifyPassword(
      userId,
      currentPassword,
    );

    if (!isCurrentPasswordValid) {
      throw new InvalidCredentialsError();
    }

    await this.users.unlinkGoogleAccount(userId);
  }
}
