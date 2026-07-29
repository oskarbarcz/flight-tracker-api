import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infra/database/repository/users.repository';
import { SessionService } from '../../infra/service/session.service';
import { SignInResponse } from '../../infra/http/request/sign-in.dto';

export class RefreshTokenCommand {
  constructor(
    public readonly userId: string,
    public readonly sessionId: string,
  ) {}
}

@CommandHandler(RefreshTokenCommand)
export class RefreshTokenHandler implements ICommandHandler<RefreshTokenCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly sessionService: SessionService,
  ) {}

  async execute(command: RefreshTokenCommand): Promise<SignInResponse> {
    const { userId, sessionId } = command;
    const user = await this.users.findById(userId);

    return this.sessionService.renew(user, sessionId);
  }
}
