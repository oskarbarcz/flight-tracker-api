import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { User } from '../../../model/user.model';

export class ListUsersFilters extends PartialType(
  PickType(User, ['pilotLicenseId']),
) {}

export class GetUserDto extends OmitType(User, [
  'password',
  'simbriefUserId',
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

export class GetOwnUserDto extends OmitType(User, ['password']) {
  @ApiProperty({
    description:
      'Addresses of the account: the active one, plus a pending address while ' +
      'an email change awaits confirmation',
    type: [UserEmailDto],
  })
  emails!: UserEmailDto[];
}

export type OwnUserRecord = Omit<GetOwnUserDto, 'emails'> & {
  emailConfirmedAt: Date | null;
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
