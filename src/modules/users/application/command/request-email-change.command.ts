import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserTokenType } from '../../../../../prisma/client/client';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { normalizeEmail } from '../../../../core/utils/email';
import { UserTokenRepository } from '../../infra/database/repository/user-token.repository';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { EmailChangeRequestedEvent } from '../../../../core/domain/events/dto/user-credentials.events';
import { InvalidCredentialsError } from '../../../auth/model/error/auth.error';
import { PasswordNotSetError } from '../../model/error/user-password.error';
import {
  EmailAlreadyInUseError,
  NewEmailMustDifferError,
} from '../../model/error/user-email.error';

const TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const RESEND_GUARD_MS = 5 * 60 * 1000;

export class RequestEmailChangeCommand {
  constructor(
    public readonly userId: string,
    public readonly newEmail: string,
    public readonly currentPassword: string,
  ) {}
}

@CommandHandler(RequestEmailChangeCommand)
export class RequestEmailChangeHandler implements ICommandHandler<RequestEmailChangeCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly tokens: UserTokenRepository,
    private readonly eventEmitter: DomainEventEmitter,
  ) {}

  async execute(command: RequestEmailChangeCommand): Promise<void> {
    const { userId, currentPassword } = command;
    const newEmail = normalizeEmail(command.newEmail);

    const user = await this.users.findById(userId);
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

    if (newEmail === normalizeEmail(user.email)) {
      throw new NewEmailMustDifferError();
    }

    if (await this.users.isEmailTaken(newEmail, userId)) {
      throw new EmailAlreadyInUseError();
    }

    const recent = await this.tokens.findRecentUnconsumed(
      userId,
      UserTokenType.email_change,
      RESEND_GUARD_MS,
    );

    if (recent) {
      return;
    }

    const { rawToken } = await this.tokens.issue(
      userId,
      UserTokenType.email_change,
      TOKEN_TTL_MS,
      newEmail,
    );

    const event = new EmailChangeRequestedEvent({
      userId,
      currentEmail: user.email,
      newEmail,
      token: rawToken,
    });

    this.eventEmitter.emit(event);
  }
}
