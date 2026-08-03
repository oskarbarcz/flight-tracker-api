import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  GetOwnUserDto,
  UserEmailDto,
} from '../../infra/http/request/get-user.dto';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { UserTokenRepository } from '../../infra/database/repository/user-token.repository';
import { UserTokenType } from '../../../../../prisma/client/client';

export class GetOwnUserQuery extends Query<GetOwnUserDto> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetOwnUserQuery)
export class GetOwnUserHandler implements IQueryHandler<GetOwnUserQuery> {
  constructor(
    private readonly repository: UsersRepository,
    private readonly tokens: UserTokenRepository,
  ) {}

  async execute(query: GetOwnUserQuery): Promise<GetOwnUserDto> {
    const { emailConfirmedAt, ...user } = await this.repository.findOwnById(
      query.userId,
    );

    const pending = await this.tokens.findPending(
      query.userId,
      UserTokenType.email_change,
    );

    const emails: UserEmailDto[] = [
      {
        email: user.email,
        isConfirmed: emailConfirmedAt !== null,
        active: true,
      },
    ];

    if (pending?.newEmail) {
      emails.push({
        email: pending.newEmail,
        isConfirmed: false,
        active: false,
      });
    }

    return { ...user, emails };
  }
}
