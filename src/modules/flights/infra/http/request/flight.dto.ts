import { ScheduledTimesheet } from '../../../model/timesheet.model';
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { Loadsheets } from '../../../model/loadsheet.model';
import { Type } from 'class-transformer';
import { Flight, FlightPhase } from '../../../model/flight.model';

class PreliminaryLoadsheetOnly extends OmitType(Loadsheets, ['final']) {}

export class CreateFlightRequest extends OmitType(Flight, [
  'id',
  'status',
  'aircraft',
  'airports',
  'timesheet',
  'loadsheets',
  'operator',
  'rotationId',
  'rotation',
  'source',
  'isFlightDiverted',
  'isEmergencyDeclared',
  'hasFlightPath',
  'createdAt',
  'departureGateId',
  'departureRunwayId',
  'arrivalGateId',
  'arrivalRunwayId',
]) {
  @ApiProperty({
    description:
      'System unique identifier of the airport where the flight is departing',
    example: 'fe75ec7d-afbe-4514-a935-40c54f475278',
  })
  @IsUUID()
  @IsString()
  departureAirportId!: string;

  @ApiProperty({
    description:
      'System unique identifier of the airport where the flight is arriving',
    example: 'fe75ec7d-afbe-4514-a935-40c54f475278',
  })
  @IsUUID()
  @IsString()
  destinationAirportId!: string;

  @ApiProperty({
    description: 'Initial timesheet reported to air traffic control services',
    type: ScheduledTimesheet,
  })
  @IsNotEmpty()
  timesheet!: ScheduledTimesheet;

  @ApiProperty({
    description: 'Initial loadsheet filled by operations team for pilots',
    type: PreliminaryLoadsheetOnly,
  })
  @Type(() => PreliminaryLoadsheetOnly)
  @IsNotEmpty()
  loadsheets!: PreliminaryLoadsheetOnly;
}

export class GetFlightResponse extends OmitType(Flight, [
  'rotation',
  'aircraftId',
  'operatorId',
]) {}

export class FlightListFilters {
  @IsOptional()
  @IsEnum(FlightPhase)
  phase?: FlightPhase;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}

export class UpdateFlightVisibilityRequest extends PickType(Flight, [
  'tracking',
]) {}

export class UpdateDepartureGateRequest {
  @ApiProperty({
    description: 'Departure gate unique identifier',
    example: '4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101',
  })
  @IsUUID()
  departureGateId!: string;
}

export class UpdateDepartureRunwayRequest {
  @ApiProperty({
    description: 'Departure runway unique identifier',
    example: '32121288-2550-4b81-a558-9a7193ef6c97',
  })
  @IsUUID()
  departureRunwayId!: string;
}

export class UpdateArrivalGateRequest {
  @ApiProperty({
    description: 'Arrival gate unique identifier',
    example: '4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101',
  })
  @IsUUID()
  arrivalGateId!: string;
}

export class UpdateArrivalRunwayRequest {
  @ApiProperty({
    description: 'Arrival runway unique identifier',
    example: '32121288-2550-4b81-a558-9a7193ef6c97',
  })
  @IsUUID()
  arrivalRunwayId!: string;
}

export class UpdatePredictedTimesheetRequest {
  @ApiProperty({
    description:
      'Predicted time when the aircraft leaves the gates. ' +
      'Omit to preserve the current value, send null to clear it.',
    example: '2025-01-01T12:00:00.000Z',
    type: Date,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  offBlockTime?: Date | null;

  @ApiProperty({
    description:
      'Predicted time when the aircraft takes off. ' +
      'Omit to preserve the current value, send null to clear it.',
    example: '2025-01-01T12:15:00.000Z',
    type: Date,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  takeoffTime?: Date | null;

  @ApiProperty({
    description:
      'Predicted time when the aircraft lands. ' +
      'Omit to preserve the current value, send null to clear it.',
    example: '2025-01-01T21:00:00.000Z',
    type: Date,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  arrivalTime?: Date | null;

  @ApiProperty({
    description:
      'Predicted time when the aircraft parks at the gates. ' +
      'Omit to preserve the current value, send null to clear it.',
    example: '2025-01-01T21:10:00.000Z',
    type: Date,
    required: false,
    nullable: true,
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  onBlockTime?: Date | null;
}
