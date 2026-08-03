import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserTokenType } from '../../../../../prisma/client/client';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { UserTokenRepository } from '../../infra/database/repository/user-token.repository';
import { DomainEventEmitter } from '../../../../core/domain/events/domain-event-emitter';
import { PasswordResetRequestedEvent } from '../../../../core/domain/events/dto/user-credentials.events';

const TOKEN_TTL_MS = 60 * 60 * 1000;
const RESEND_GUARD_MS = 5 * 60 * 1000;

export class RequestPasswordResetCommand {
  constructor(public readonly email: string) {}
}

@CommandHandler(RequestPasswordResetCommand)
export class RequestPasswordResetHandler implements ICommandHandler<RequestPasswordResetCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly tokens: UserTokenRepository,
    private readonly eventEmitter: DomainEventEmitter,
  ) {}

  async execute(command: RequestPasswordResetCommand): Promise<void> {
    const user = await this.users.findByEmail(command.email);

    if (!user) {
      return;
    }

    const hasPassword = await this.users.hasPassword(user.id);

    if (!hasPassword) {
      return;
    }

    const recent = await this.tokens.findRecentUnconsumed(
      user.id,
      UserTokenType.password_reset,
      RESEND_GUARD_MS,
    );

    if (recent) {
      return;
    }

    const { rawToken } = await this.tokens.issue(
      user.id,
      UserTokenType.password_reset,
      TOKEN_TTL_MS,
    );

    const event = new PasswordResetRequestedEvent({
      userId: user.id,
      email: user.email,
      token: rawToken,
    });

    this.eventEmitter.emit(event);
  }
}
