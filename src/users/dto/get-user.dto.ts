import { OmitType, PartialType, PickType } from '@nestjs/swagger';
import { User } from '../entities/user.entity';

export class ListUsersFilters extends PartialType(
  PickType(User, ['pilotLicenseId']),
) {}

export class GetUserDto extends OmitType(User, ['password']) {}
