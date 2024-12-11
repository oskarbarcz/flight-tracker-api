import { Aircraft } from '../entities/aircraft.entity';
import { OmitType } from '@nestjs/swagger';

export class CreateAircraftDto extends OmitType(Aircraft, ['id'] as const) {}
