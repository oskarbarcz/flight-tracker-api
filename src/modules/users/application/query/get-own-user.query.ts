import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import {
  GetOwnUserDto,
  OwnUserRecord,
  UserEmailDto,
  UserIdentitiesDto,
} from '../../infra/http/request/get-user.dto';
import { buildDiscordAvatarUrl } from '../../../../core/provider/discord/types/discord-identity.types';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { UserTokenRepository } from '../../infra/database/repository/user-token.repository';
import { UserTokenType } from '../../../../../prisma/client/client';

type LinkedIdentityFields = Pick<
  OwnUserRecord,
  | 'googleId'
  | 'googleEmail'
  | 'discordId'
  | 'discordUsername'
  | 'discordGlobalName'
  | 'discordAvatar'
>;

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
    const record = await this.repository.findOwnById(query.userId);
    const {
      emailConfirmedAt,
      googleId,
      googleEmail,
      discordId,
      discordUsername,
      discordGlobalName,
      discordAvatar,
      ...user
    } = record;

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

    const identities = this.resolveIdentities({
      googleId,
      googleEmail,
      discordId,
      discordUsername,
      discordGlobalName,
      discordAvatar,
    });

    return { ...user, emails, identities };
  }

  private resolveIdentities(fields: LinkedIdentityFields): UserIdentitiesDto {
    return {
      google: !fields.googleId
        ? { linked: false }
        : { linked: true, email: fields.googleEmail },
      discord: !fields.discordId
        ? { linked: false }
        : {
            linked: true,
            userId: fields.discordId,
            username: fields.discordUsername ?? '',
            globalName: fields.discordGlobalName,
            avatarUrl: buildDiscordAvatarUrl(
              fields.discordId,
              fields.discordAvatar,
            ),
          },
    };
  }
}
