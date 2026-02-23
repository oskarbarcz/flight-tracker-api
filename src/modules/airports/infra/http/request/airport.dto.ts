import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Airport, Continent } from '../../../model/airport.model';

export class CreateAirportRequest extends OmitType(Airport, ['id']) {}

export class UpdateAirportResponse extends PartialType(CreateAirportRequest) {}

export class GetAirportResponse extends Airport {}

export class AirportListFilters {
  @ApiProperty({ required: false, enum: Continent })
  @IsEnum(Continent)
  @IsOptional()
  continent?: Continent;
}
