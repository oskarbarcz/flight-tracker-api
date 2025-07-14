import { OmitType } from '@nestjs/swagger';
import { Airport } from '../entity/airport.entity';

export class CreateAirportDto extends OmitType(Airport, ['id'] as const) {}
