import { ScheduledTimesheet } from '../../../model/timesheet.model';
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateIf,
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
  'createdAt',
  'departureGateId',
  'departureRunwayId',
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
    description: 'Departure gate unique identifier, or null to clear',
    example: '4c2d3df4-3b5a-4f3c-9a21-7f1e9cbd2101',
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  departureGateId!: string | null;
}

export class UpdateDepartureRunwayRequest {
  @ApiProperty({
    description: 'Departure runway unique identifier, or null to clear',
    example: '32121288-2550-4b81-a558-9a7193ef6c97',
    nullable: true,
  })
  @ValidateIf((_, value) => value !== null)
  @IsUUID()
  departureRunwayId!: string | null;
}
