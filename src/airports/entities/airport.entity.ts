import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsTimeZone } from 'class-validator';

export class Airport {
  @ApiProperty({
    description: 'Airport unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
  })
  id: string;

  @ApiProperty({
    description: 'Airport type ICAO code',
    example: 'EDDF',
  })
  @IsString()
  @IsNotEmpty()
  icaoCode: string;

  @ApiProperty({
    description: 'Airport name',
    example: 'Frankfurt Rhein/Main',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Country where airport is located',
    example: 'Germany',
  })
  @IsString()
  @IsNotEmpty()
  country: string;

  @ApiProperty({
    description: 'IANA standard timezone',
    example: 'Europe/Berlin',
  })
  @IsString()
  @IsTimeZone()
  @IsNotEmpty()
  timezone: string;
}

export enum AirportType {
  Departure = 'departure',
  Destination = 'destination',
  EtopsAlternate = 'etops_alternate',
  DestinationAlternate = 'destination_alternate',
}

export class AirportWithType extends Airport {
  @ApiProperty({
    description: 'Airport type',
    example: 'departure',
    enum: AirportType,
  })
  type: AirportType;
}
