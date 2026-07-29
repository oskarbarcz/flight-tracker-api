import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../../users/infra/database/repository/users.repository';
import { GoogleIdentityClient } from '../../../../core/provider/google/client/google-identity.client';
import { SessionService } from '../../infra/service/session.service';
import { SignInResponse } from '../../infra/http/request/sign-in.dto';
import { GoogleAccountNotLinkedError } from '../../model/error/google-auth.error';

export class SignInWithGoogleCommand {
  constructor(public readonly idToken: string) {}
}

@CommandHandler(SignInWithGoogleCommand)
export class SignInWithGoogleHandler implements ICommandHandler<SignInWithGoogleCommand> {
  constructor(
    private readonly users: UsersRepository,
    private readonly googleIdentityClient: GoogleIdentityClient,
    private readonly sessionService: SessionService,
  ) {}

  async execute(command: SignInWithGoogleCommand): Promise<SignInResponse> {
    const identity = await this.googleIdentityClient.verifyIdToken(
      command.idToken,
    );
    const user = await this.users.findByGoogleId(identity.googleId);

    if (user === null) {
      throw new GoogleAccountNotLinkedError();
    }

    return this.sessionService.open(user);
  }
}
