import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';
import { Airport, Continent, DataQuality } from '../../../model/airport.model';
import { IsCountryCode } from '../../../../countries/model/is-country-code.validator';
import { normalizeCountryCode } from '../../../../countries/model/country.model';

export class CreateAirportRequest extends OmitType(Airport, ['id', 'country']) {
  @ApiProperty({
    description: 'ISO 3166-1 alpha-2 code of the country the airport is in',
    example: 'DE',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? normalizeCountryCode(value) : value,
  )
  @IsCountryCode()
  country!: string;
}

export class UpdateAirportResponse extends PartialType(CreateAirportRequest) {}

export class GetAirportResponse extends Airport {}

export class AirportListFilters {
  @ApiProperty({ required: false, enum: Continent })
  @IsEnum(Continent)
  @IsOptional()
  continent?: Continent;

  @ApiProperty({ required: false, enum: DataQuality })
  @IsEnum(DataQuality)
  @IsOptional()
  dataQuality?: DataQuality;
}
