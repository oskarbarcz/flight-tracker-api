import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Length,
} from 'class-validator';
import { Continent } from '../../airports/model/airport.model';

export enum OperatorType {
  Legacy = 'legacy',
  LowCost = 'low_cost',
  Charter = 'charter',
  GovernmentMilitary = 'government_military',
}

export class Operator {
  @ApiProperty({
    description: 'Operator unique system identifier',
    example: 'eab840d0-901b-4ad5-90e3-7f2b0b13ed2d',
  })
  id!: string;

  @ApiProperty({
    description: 'Operator ICAO code',
    example: 'DLH',
  })
  @IsString()
  @Length(3, 3)
  @IsNotEmpty()
  icaoCode!: string;

  @ApiProperty({
    description: 'Operator IATA code',
    example: 'LH',
  })
  @IsString()
  @Length(2, 2)
  @IsNotEmpty()
  iataCode!: string;

  @ApiProperty({
    description: 'Operator name',
    example: 'Condor',
  })
  @IsString()
  @IsNotEmpty()
  shortName!: string;

  @ApiProperty({
    description: 'Full operator company name',
    example: 'Condor Flugdienst GmbH',
  })
  @IsString()
  @IsNotEmpty()
  fullName!: string;

  @ApiProperty({
    description: 'Callsign used by air traffic control services',
    example: 'Condor',
  })
  @IsString()
  @IsNotEmpty()
  callsign!: string;

  @ApiProperty({
    description: 'Operator fleet size',
    example: 104,
  })
  fleetSize!: number;

  @ApiProperty({
    description: 'Operator fleet types (ICAO codes)',
    example: ['A35K', 'B773'],
    type: 'string',
    isArray: true,
  })
  fleetTypes!: string[];

  @ApiProperty({
    description: 'Operator average fleet age',
    example: 12.5,
    required: false,
    default: 5,
  })
  @IsNumber({ maxDecimalPlaces: 1 })
  avgFleetAge!: number;

  @ApiProperty({
    description: 'Operator logo URL',
    example: 'https://example.com/background.png',
    required: false,
    default: null,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  logoUrl?: string | null;

  @ApiProperty({
    description: 'Operator logo URL',
    example: 'https://example.com/background.png',
    required: false,
    default: null,
  })
  @IsOptional()
  @IsString()
  @IsUrl()
  backgroundUrl?: string | null;

  @ApiProperty({
    description: 'Operator type',
    example: OperatorType.Legacy,
    enum: OperatorType,
    default: OperatorType.Legacy,
    required: false,
  })
  @IsNotEmpty()
  @IsEnum(OperatorType)
  type!: OperatorType;

  @ApiProperty({
    description: 'Continent operator primarily operates on',
    example: Continent.Europe,
    enum: Continent,
    default: Continent.Europe,
    required: false,
  })
  @IsNotEmpty()
  @IsEnum(Continent)
  continent!: Continent;

  @ApiProperty({
    description: 'Operator primary airport hubs (IATA codes)',
    example: ['MUC', 'FRA'],
    type: 'string',
    isArray: true,
    required: false,
    default: [],
  })
  @IsString({ each: true })
  @IsNotEmpty()
  hubs!: string[];
}
