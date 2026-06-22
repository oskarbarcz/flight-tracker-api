import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Aircraft, AircraftState } from '../../../model/aircraft.model';
import { IsNotEmpty, IsString, Length } from 'class-validator';
import { LegacyOperatorResponse } from './operator.request';

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
  })
  @IsString()
  @IsNotEmpty()
  selcal!: string;

  @ApiProperty({
    description: 'Aircraft livery description and age',
    example: 'Boeing House (2024)',
  })
  @IsString()
  @IsNotEmpty()
  livery!: string;
}

export class UpdateAircraftRequest extends PartialType(CreateAircraftRequest) {}

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
    description: 'Home base airport unique identifier',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    nullable: true,
    default: null,
  })
  baseAirportId!: string | null;

  @ApiProperty({
    description: 'Identifier of the airport where the aircraft last landed',
    example: 'ba9ac708-0cef-4d92-a824-4e95f60bd752',
    nullable: true,
    default: null,
  })
  lastAirportId!: string | null;

  @ApiProperty({
    description: 'Timestamp when the last airport was recorded',
    example: '2025-01-01T00:00:00.000Z',
    nullable: true,
    default: null,
  })
  lastAirportUpdatedAt!: Date | null;
}

export class LegacyCreateAircraftResponse extends Aircraft {
  @ApiProperty({
    description: 'Aircraft operator',
    type: LegacyOperatorResponse,
    deprecated: true,
  })
  operator!: LegacyOperatorResponse | null;
}
