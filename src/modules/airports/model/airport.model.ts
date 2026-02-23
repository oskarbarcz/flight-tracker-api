import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsTimeZone,
  Length,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export enum Continent {
  Africa = 'africa',
  Asia = 'asia',
  Europe = 'europe',
  NorthAmerica = 'north_america',
  Oceania = 'oceania',
  SouthAmerica = 'south_america',
}

export class Coordinates {
  @ApiProperty({
    description: 'Airport longitude in decimal degrees',
    example: 8.570556,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-180)
  @Max(180)
  longitude!: number;

  @ApiProperty({
    description: 'Airport latitude in decimal degrees',
    example: 50.033333,
  })
  @IsNumber({ allowNaN: false, allowInfinity: false })
  @Min(-90)
  @Max(90)
  latitude!: number;
}

export class Airport {
  @ApiProperty({
    description: 'Airport unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
  })
  id!: string;

  @ApiProperty({
    description: 'Airport ICAO code',
    example: 'EDDF',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  icaoCode!: string;

  @ApiProperty({
    description: 'Airport IATA code',
    example: 'FRA',
  })
  @IsString()
  @IsNotEmpty()
  @Length(3, 3)
  iataCode!: string;

  @ApiProperty({
    description: 'Airport name',
    example: 'Frankfurt Rhein/Main',
  })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({
    description: 'City where airport is located',
    example: 'Frankfurt',
  })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({
    description: 'Country where airport is located',
    example: 'Germany',
  })
  @IsString()
  @IsNotEmpty()
  country!: string;

  @ApiProperty({
    description: 'IANA standard timezone',
    example: 'Europe/Berlin',
  })
  @IsString()
  @IsTimeZone()
  @IsNotEmpty()
  timezone!: string;

  @ApiProperty({
    description: 'Airport coordinates',
    type: Coordinates,
  })
  @Type(() => Coordinates)
  @IsNotEmpty()
  location!: Coordinates;

  @ApiProperty({
    description: 'Continent where airport is located',
    example: Continent.Europe,
    enum: Continent,
  })
  @IsNotEmpty()
  @IsEnum(Continent)
  continent!: Continent;
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
  type!: AirportType;
}
