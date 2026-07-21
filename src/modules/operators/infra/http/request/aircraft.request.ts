import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Aircraft, AircraftState } from '../../../model/aircraft.model';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
} from 'class-validator';
import { LegacyOperatorResponse } from './operator.request';
import { Coordinates } from '../../../../airports/model/airport.model';

export class CreateAircraftRequest {
  @ApiProperty({
    description:
      'ICAO aircraft type designator (4-letter code). Must match an airframe defined in the curated airframes list.',
    example: 'B77W',
  })
  @IsString()
  @IsNotEmpty()
  @Length(4, 4)
  type!: string;

  @ApiProperty({
    description: 'Aircraft registration matching act of registration',
    example: 'D-AIMC',
  })
  @IsString()
  @IsNotEmpty()
  registration!: string;

  @ApiProperty({
    description: 'Aircraft SELCAL code',
    example: 'KR-QL',
    nullable: true,
    required: false,
  })
  @IsOptional()
  @IsString()
  selcal?: string | null;

  @ApiProperty({
    description:
      'Aircraft livery description and age; defaults to "<operator short name> <current year>" when omitted',
    example: 'Boeing House (2024)',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  livery?: string;

  @ApiProperty({
    description: 'Home base airport unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
  })
  @IsUUID()
  baseAirportId!: string;

  @ApiProperty({
    description:
      'ETOPS certification threshold in minutes; omit or null when the aircraft is not ETOPS-certified',
    enum: [60, 75, 90, 120, 180],
    nullable: true,
    required: false,
    example: 180,
  })
  @IsOptional()
  @IsIn([60, 75, 90, 120, 180])
  etopsThresholdMinutes?: number | null;
}

export class UpdateAircraftRequest extends PartialType(CreateAircraftRequest) {}

export class AircraftAirport {
  @ApiProperty({
    description: 'Airport unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
  })
  id!: string;

  @ApiProperty({ description: 'Airport IATA code', example: 'FRA' })
  iataCode!: string;

  @ApiProperty({ description: 'Airport name', example: 'Frankfurt Rhein/Main' })
  name!: string;

  @ApiProperty({ description: 'City the airport serves', example: 'Frankfurt' })
  city!: string;

  @ApiProperty({
    description: 'Country the airport is located in',
    example: 'Germany',
  })
  country!: string;

  @ApiProperty({ description: 'Airport coordinates', type: Coordinates })
  location!: Coordinates;
}

export class AircraftParkingPosition {
  @ApiProperty({
    description: 'Parking position unique system identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
  })
  id!: string;

  @ApiProperty({ description: 'Parking position name', example: '445' })
  name!: string;

  @ApiProperty({
    description: 'Parking position coordinates',
    type: Coordinates,
  })
  coordinates!: Coordinates;
}

export class GetAircraftResponse extends Aircraft {
  @ApiProperty({
    description:
      'Current operational state of the aircraft, driven by the lifecycle ' +
      'of the flight it is assigned to',
    enum: AircraftState,
    example: AircraftState.Idle,
  })
  currentState!: AircraftState;

  @ApiProperty({
    description: 'Home base airport',
    type: AircraftAirport,
    nullable: true,
  })
  baseAirport!: AircraftAirport | null;

  @ApiProperty({
    description: 'Airport where the aircraft last landed',
    type: AircraftAirport,
    nullable: true,
  })
  lastAirport!: AircraftAirport | null;

  @ApiProperty({
    description: 'Timestamp when the last airport was recorded',
    example: '2025-01-01T00:00:00.000Z',
    nullable: true,
    default: null,
  })
  lastAirportUpdatedAt!: Date | null;

  @ApiProperty({
    description: 'Parking position where the aircraft last parked',
    type: AircraftParkingPosition,
    nullable: true,
  })
  lastParkingPosition!: AircraftParkingPosition | null;

  @ApiProperty({
    description:
      'ETOPS certification threshold in minutes; null when not certified',
    enum: [60, 75, 90, 120, 180],
    nullable: true,
    example: 180,
  })
  etopsThresholdMinutes!: number | null;
}

export class LegacyCreateAircraftResponse extends Aircraft {
  @ApiProperty({
    description: 'Aircraft operator',
    type: LegacyOperatorResponse,
    deprecated: true,
  })
  operator!: LegacyOperatorResponse | null;
}
