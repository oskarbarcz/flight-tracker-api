import { ApiProperty } from '@nestjs/swagger';
import { AirportWithType } from '../../airports/entity/airport.entity';
import { FullTimesheet } from './timesheet.entity';
import { CreateAircraftResponse } from '../../aircraft/dto/create-aircraft.dto';
import { Operator } from '../../operators/entity/operator.entity';
import { Loadsheets } from './loadsheet.entity';
import { Rotation } from '../../rotations/entity/rotation.entity';
import { IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export enum FlightStatus {
  Created = 'created',
  Ready = 'ready',
  CheckedIn = 'checked_in',
  BoardingStarted = 'boarding_started',
  BoardingFinished = 'boarding_finished',
  TaxiingOut = 'taxiing_out',
  InCruise = 'in_cruise',
  TaxiingIn = 'taxiing_in',
  OnBlock = 'on_block',
  OffboardingStarted = 'offboarding_started',
  OffboardingFinished = 'offboarding_finished',
  Closed = 'closed',
}

export enum FlightSource {
  Manual = 'manual',
  Simbrief = 'simbrief',
}

export enum FlightTracking {
  Public = 'public',
  Private = 'private',
  Disabled = 'disabled',
}

export class Flight {
  @ApiProperty({
    description: 'Flight unique system identifier',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  id!: string;

  @ApiProperty({
    description: 'Flight number used by ticketing systems',
    example: 'LH450',
  })
  flightNumber!: string;

  @ApiProperty({
    description: 'Callsign used by air traffic services',
    example: 'DLH450',
  })
  callsign!: string;

  @ApiProperty({
    description: 'Flight status',
    example: FlightStatus.Created,
    enum: FlightStatus,
  })
  status!: FlightStatus;

  @ApiProperty({
    description: 'Aircraft system unique identifier',
    example: 'fe75ec7d-afbe-4514-a935-40c54f475278',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  aircraftId!: string;

  @ApiProperty({
    description: 'Aircraft reported for flight',
  })
  aircraft!: CreateAircraftResponse;

  @ApiProperty({
    description: 'Airports related to the flight',
  })
  airports!: AirportWithType[];

  @ApiProperty({
    description: 'Timesheet',
  })
  timesheet!: FullTimesheet;

  @ApiProperty({
    description: 'Loadsheets',
    type: Loadsheets,
  })
  loadsheets!: Loadsheets;

  @ApiProperty({
    description: 'Operator system unique identifier',
    example: 'fe75ec7d-afbe-4514-a935-40c54f475278',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID(4)
  operatorId!: string;

  @ApiProperty({
    description: 'Flight operator',
    type: Operator,
  })
  operator!: Operator;

  @ApiProperty({
    description: 'Rotation this flight belongs to',
    type: Rotation,
    required: false,
    nullable: true,
  })
  rotation?: Rotation;

  @ApiProperty({
    description: 'Unique identifier of rotation this flight belongs to',
    type: 'string',
    nullable: true,
  })
  rotationId!: string | null;

  @ApiProperty({
    description: 'Source how flight was created',
    type: 'string',
    enum: FlightSource,
  })
  source!: FlightSource;

  @ApiProperty({
    description:
      'Flight tracking settings <br />' +
      '**public**: flight can be tracked by anyone and will be listed. <br>' +
      '**private**: flight can be tracked by people having a dedicated link, flight will not be listed.<br>' +
      '**disabled**: flight cannot be tracked online.',
    enum: FlightTracking,
    example: FlightTracking.Private,
  })
  @IsEnum(FlightTracking)
  @IsString()
  tracking: FlightTracking = FlightTracking.Private;

  @ApiProperty({
    description: 'Flag if flight was diverted',
    example: false,
  })
  isFlightDiverted!: boolean;

  @ApiProperty({
    description: 'Timestamp when the flight record was created',
    example: '2025-01-01T00:00:00.000Z',
    type: 'string',
  })
  createdAt!: Date;
}

export class FlightPathElement {
  @ApiProperty({
    description: 'Callsign used by air traffic services, without spaces',
    example: 'DLH450',
  })
  callsign!: string;

  @ApiProperty({
    description: 'Timestamp of the flight event',
    example: '2023-10-01T12:00:00Z',
  })
  date!: Date;

  @ApiProperty({
    description: 'Latitude of the flight event',
    example: 52.52,
    minimum: -90,
    maximum: 90,
  })
  latitude!: number;

  @ApiProperty({
    description: 'Longitude of the flight event',
    example: 13.405,
    minimum: -180,
    maximum: 180,
  })
  longitude!: number;

  @ApiProperty({
    description: 'The vertical rate of the aircraft in fpm (feet per minute)',
    example: 1500,
    required: false,
  })
  verticalRate?: number;

  @ApiProperty({
    description: 'The squawk code of the aircraft (4 digits, each 0-7)',
    example: '1234',
    required: false,
  })
  squawk?: string;

  @ApiProperty({
    description: 'The ground speed of the aircraft in knots',
    example: 250,
    required: false,
  })
  groundSpeed?: number;

  @ApiProperty({
    description: 'The track angle of the aircraft in degrees',
    example: 180,
    required: false,
  })
  track?: number;

  @ApiProperty({
    description: 'Indicates if the aircraft is alerting',
    example: false,
    required: false,
  })
  alert?: boolean;

  @ApiProperty({
    description: 'Indicates if the aircraft is in an emergency state',
    example: false,
    required: false,
  })
  emergency?: boolean;

  @ApiProperty({
    description:
      'Indicates if the aircraft has special position identification (IDENT)',
    example: true,
    required: false,
  })
  spi?: boolean;

  @ApiProperty({
    description: 'Indicates if the aircraft is on the ground',
    example: true,
    required: false,
  })
  isOnGround?: boolean;

  @ApiProperty({
    description: 'Aircraft altitude in feet',
    example: 29000,
    required: false,
  })
  altitude?: number;
}

export function trimCallsign(callsign: string): string {
  return callsign.replace(/\s+/g, '').toUpperCase();
}
