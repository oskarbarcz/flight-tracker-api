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
