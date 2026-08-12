import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { User } from '../../../model/user.model';

export class ListUsersFilters extends PartialType(
  PickType(User, ['pilotLicenseId']),
) {}

export class GetUserDto extends OmitType(User, [
  'password',
  'simbriefUserId',
  'defaultWeatherSource',
]) {}

export class UserEmailDto {
  @ApiProperty({
    description: 'Email address held by the account',
    example: 'operations@example.com',
  })
  email!: string;

  @ApiProperty({
    description:
      'Whether control of the address has been proven by opening a link sent to it',
    example: true,
  })
  isConfirmed!: boolean;

  @ApiProperty({
    description:
      'Whether the account signs in with this address today. A pending address ' +
      'becomes active once it is confirmed.',
    example: true,
  })
  active!: boolean;
}

export class GoogleIdentityDto {
  @ApiProperty({
    description: 'Whether a Google account is linked to this user',
    example: true,
  })
  linked!: boolean;

  @ApiProperty({
    description:
      'Address of the linked Google account, as the account reported it when ' +
      'it was linked. Null for links made before the address was recorded, ' +
      'and absent when no Google account is linked.',
    example: 'oskar@gmail.com',
    type: 'string',
    nullable: true,
    required: false,
  })
  email?: string | null;
}

export class DiscordIdentityDto {
  @ApiProperty({
    description: 'Whether a Discord account is linked to this user',
    example: true,
  })
  linked!: boolean;

  @ApiProperty({
    description: 'Discord account identifier briefings are delivered to',
    example: '100000000000000100',
    required: false,
  })
  userId?: string;

  @ApiProperty({
    description: 'Discord handle captured when the account was linked',
    example: 'michael.doe',
    required: false,
  })
  username?: string;

  @ApiProperty({
    description: 'Discord display name captured when the account was linked',
    example: 'Michael Doe',
    type: 'string',
    nullable: true,
    required: false,
  })
  globalName?: string | null;

  @ApiProperty({
    description: 'Avatar of the linked Discord account, null when it has none',
    example:
      'https://cdn.discordapp.com/avatars/100000000000000100/b1c2d3e4f5061728394a5b6c7d8e9f00.png',
    type: 'string',
    nullable: true,
    required: false,
  })
  avatarUrl?: string | null;
}

export class UserIdentitiesDto {
  @ApiProperty({
    description: 'Google account linked to this user',
    type: GoogleIdentityDto,
  })
  google!: GoogleIdentityDto;

  @ApiProperty({
    description: 'Discord account linked to this user',
    type: DiscordIdentityDto,
  })
  discord!: DiscordIdentityDto;
}

export class GetOwnUserDto extends OmitType(User, ['password']) {
  @ApiProperty({
    description:
      'Addresses of the account: the active one, plus a pending address while ' +
      'an email change awaits confirmation',
    type: [UserEmailDto],
  })
  emails!: UserEmailDto[];

  @ApiProperty({
    description:
      'External accounts linked to this user. Reported from what was stored ' +
      'when each account was linked — no provider is contacted.',
    type: UserIdentitiesDto,
  })
  identities!: UserIdentitiesDto;
}

export type OwnUserRecord = Omit<GetOwnUserDto, 'emails' | 'identities'> & {
  emailConfirmedAt: Date | null;
  googleId: string | null;
  googleEmail: string | null;
  discordId: string | null;
  discordUsername: string | null;
  discordGlobalName: string | null;
  discordAvatar: string | null;
};

export class UserStatUnit {
  @ApiProperty({
    description: 'User block time in minutes',
    example: 3760,
    deprecated: true,
  })
  blockTime!: number;

  @ApiProperty({
    description: 'User block time in minutes',
    example: 3760,
  })
  totalFlightTime!: number;

  @ApiProperty({
    description: 'All flights total fuel burned in kg',
    example: 326000,
  })
  totalFuelBurned!: number;

  @ApiProperty({
    description: 'All flights total great circle distance in nautical miles',
    example: 7850,
  })
  totalGreatCircleDistance!: number;
}

export class GetUserStatsResponse {
  @ApiProperty({
    description: 'Stats in total',
    type: UserStatUnit,
  })
  total!: UserStatUnit;
}

export class PilotDto extends PickType(User, [
  'id',
  'name',
  'pilotLicenseId',
]) {}

export class FlightPilotDto extends PilotDto {
  @ApiProperty({
    description: 'Total accumulated block time in minutes',
    example: 1797,
  })
  totalFlightTime!: number;
}
