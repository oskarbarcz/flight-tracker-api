import { Aircraft } from '../entities/aircraft.entity';
import { OmitType } from '@nestjs/swagger';

export class CreateAircraftRequest extends OmitType(Aircraft, [
  'id',
  'operator',
] as const) {}

export class CreateAircraftResponse extends OmitType(Aircraft, [
  'operatorId',
] as const) {}
