import { ApiProperty } from '@nestjs/swagger';

export class AirportResponse {
  @ApiProperty({
    description: 'Airport ICAO code',
    example: 'EDDF',
  })
  icao!: string;

  @ApiProperty({
    description: 'Airport IATA code',
    example: 'FRA',
  })
  iata!: string;

  @ApiProperty({
    description: 'Airport name',
    example: 'Frankfurt Rhein/Main',
  })
  name!: string;

  @ApiProperty({
    description: 'City where airport is located',
    example: 'Frankfurt',
  })
  city!: string;

  @ApiProperty({
    description: 'Region where airport is located',
    example: 'Hessen',
  })
  region!: string;

  @ApiProperty({
    description: 'Two-letter code of country where airport is located',
    example: 'DE',
  })
  country!: string;

  @ApiProperty({
    description: 'Elevation of airport above sea level in feet',
    example: 'DE',
  })
  elevation_ft!: string;

  @ApiProperty({
    description: 'Airport latitude in decimal degrees',
    example: '50.0333',
  })
  latitude!: string;

  @ApiProperty({
    description: 'Airport longitude in decimal degrees',
    example: '8.57056',
  })
  longitude!: string;

  @ApiProperty({
    description: 'IANA standard timezone',
    example: 'Europe/Berlin',
  })
  timezone!: string;
}
