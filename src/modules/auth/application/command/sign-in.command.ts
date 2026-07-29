import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infra/database/repository/users.repository';
import { SessionService } from '../../infra/service/session.service';
import { SignInResponse } from '../../infra/http/request/sign-in.dto';
import { InvalidCredentialsError } from '../../model/error/auth.error';

export class SignInCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
  ) {}
}

@CommandHandler(SignInCommand)
export class SignInHandler implements ICommandHandler<SignInCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly sessionService: SessionService,
  ) {}

  async execute(command: SignInCommand): Promise<SignInResponse> {
    const { email, password } = command;
    const user = await this.users.findByCredentials(email, password);

    if (user === null) {
      throw new InvalidCredentialsError();
    }

    return this.sessionService.open(user);
  }
}
