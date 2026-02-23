import { OmitType } from '@nestjs/swagger';
import { User } from '../../../model/user.model';

export class CreateUserDto extends OmitType(User, [
  'id',
  'currentFlightId',
] as const) {}
