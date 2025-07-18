import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Airport, Continent } from '../entity/airport.entity';
import { IsEnum, IsOptional } from 'class-validator';

export class CreateAirportDto extends OmitType(Airport, ['id'] as const) {}

export class UpdateAirportDto extends PartialType(CreateAirportDto) {}

export class AirportListFilters {
  @ApiProperty({ required: false, enum: Continent })
  @IsEnum(Continent)
  @IsOptional()
  continent?: Continent;
}
