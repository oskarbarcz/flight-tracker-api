import { OmitType } from '@nestjs/swagger';
import { Airport } from '../entities/airport.entity';

export class CreateAirportDto extends OmitType(Airport, ['id'] as const) {}
