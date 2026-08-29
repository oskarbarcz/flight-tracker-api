import { ApiProperty } from '@nestjs/swagger';
import { CountryRef } from '../../countries/model/country.model';

export class CityRef {
  @ApiProperty({
    description: 'City unique system identifier',
    example: '0f3d6a2e-9c14-4f0b-8a7d-2b5e1c8f4a63',
  })
  id!: string;

  @ApiProperty({
    description: 'City name',
    example: 'Frankfurt',
  })
  name!: string;
}

export class City extends CityRef {
  @ApiProperty({ type: CountryRef })
  country!: CountryRef;

  @ApiProperty({
    description:
      'Whether a postcard exists for this city, drawn or not. A city without one is nowhere in the postcard catalogue',
    example: true,
  })
  hasPostcard!: boolean;
}

export class ListCitiesResponse {
  @ApiProperty({ type: [City] })
  cities!: City[];
}
