import { Airport, Coordinates } from '../../airports/entity/airport.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsEnum, IsNotEmpty, IsUUID } from 'class-validator';

export enum DiversionReason {
  Emergency = 'emer',
  AirTrafficControl = 'atc',
  Fuel = 'fuel',
  Communications = 'comm',
  Medical = 'med',
  Weather = 'wx',
  Technical = 'tech',
  Security = 'sec',
  Other = 'other',
}

export enum DiversionSeverity {
  Advisory = 'advisory',
  Caution = 'caution',
  Warning = 'warning',
  Emergency = 'emergency',
}

export enum DiversionReporterRole {
  Crew = 'crew',
  Operations = 'operations',
  Dispatcher = 'dispatcher',
  AirTrafficControl = 'atc',
}

export class Diversion {
  id!: string;

  @ApiProperty({
    description: 'Diversion severity',
    example: DiversionSeverity.Emergency,
    enum: DiversionSeverity,
  })
  @IsEnum(DiversionSeverity)
  @IsNotEmpty()
  severity!: DiversionSeverity;

  @ApiProperty({
    description: 'Diversion reason',
    example: DiversionReason.Weather,
    enum: DiversionReason,
  })
  @IsEnum(DiversionReason)
  @IsNotEmpty()
  reason!: DiversionReason;

  @ApiProperty({
    description: 'Free text to describe the diversion reason in detail',
    example: 'Severe weather at destination airport',
  })
  @IsNotEmpty()
  freeText!: string;

  @ApiProperty({
    description: 'Airport coordinates',
    type: Coordinates,
  })
  @Type(() => Coordinates)
  @IsNotEmpty()
  position!: Coordinates;

  @ApiProperty({
    description: 'Should security services be notified on ground',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  notifySecurityOnGround!: boolean;

  @ApiProperty({
    description: 'Should medical services be notified on ground',
    example: false,
  })
  @IsBoolean()
  @IsNotEmpty()
  notifyMedicalOnGround!: boolean;

  @ApiProperty({
    description: 'Should fire department be notified on ground',
    example: true,
  })
  @IsBoolean()
  @IsNotEmpty()
  notifyFirefightersOnGround!: boolean;

  @ApiProperty({
    description:
      'Unique system identifier of airport where aircraft is diverting to',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
  })
  @IsNotEmpty()
  @IsUUID(4)
  airportId!: string;

  @ApiProperty({
    description: 'Airport where aircraft is diverting to',
    type: Airport,
  })
  airport!: Airport;

  @ApiProperty({
    description: 'Time when diversion decision was made',
    example: '2021-01-01T12:00:00Z',
  })
  decisionTime!: Date;

  @ApiProperty({
    description:
      'Time when aircraft is estimated to arrive at the diversion airport',
    example: '2021-01-01T12:00:00Z',
  })
  @IsNotEmpty()
  @IsDate()
  @Type(() => Date)
  estimatedTimeAtDestination!: Date;
}
