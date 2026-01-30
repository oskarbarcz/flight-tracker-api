import { ApiProperty, OmitType, PartialType, PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class ListUsersFilters extends PartialType(
  PickType(User, ['pilotLicenseId']),
) {}

export class GetUserDto extends OmitType(User, [
  'password',
  'simbriefUserId',
]) {}

export class UserStatUnit {
  @ApiProperty({
    description: 'User block time in minutes',
    example: 3760,
  })
  blockTime!: number;
}

export class UserStatsDto {
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
