import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { Airport, Continent } from '../entity/airport.entity';
import { IsEnum, IsOptional } from 'class-validator';

export class CreateAirportRequest extends OmitType(Airport, ['id']) {}

export class UpdateAirportResponse extends PartialType(CreateAirportRequest) {}

export class GetAirportResponse extends Airport {}

export class AirportListFilters {
  @ApiProperty({ required: false, enum: Continent })
  @IsEnum(Continent)
  @IsOptional()
  continent?: Continent;
}
