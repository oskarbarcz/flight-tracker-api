import { ScheduledTimesheet } from '../../../model/timesheet.model';
import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Loadsheets } from '../../../model/loadsheet.model';
import { Type } from 'class-transformer';
import { Flight, FlightPhase } from '../../../model/flight.model';
import { AirportType } from '../../../../airports/model/airport.model';
import { FlightPilotDto } from '../../../../users/infra/http/request/get-user.dto';

class PreliminaryLoadsheetOnly extends OmitType(Loadsheets, ['final']) {}

export class AlternateAirportRequest {
  @ApiProperty({
    description: 'System unique identifier of the alternate airport',
    example: 'fe75ec7d-afbe-4514-a935-40c54f475278',
  })
  @IsUUID()
  airportId!: string;

  @ApiProperty({
    description: 'Alternate airport type',
    enum: AirportType,
    example: AirportType.DestinationAlternate,
  })
  @IsEnum(AirportType)
  type!: AirportType;
}

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
  'isOffBlockDelayed',
  'createdAt',
  'departureParkingPositionId',
  'departureRunwayId',
  'arrivalParkingPositionId',
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

  @ApiProperty({
    description: 'Destination, ETOPS and enroute alternate airports',
    type: [AlternateAirportRequest],
    required: false,
    default: [],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AlternateAirportRequest)
  alternateAirports?: AlternateAirportRequest[];
}

export class GetFlightResponse extends OmitType(Flight, [
  'rotation',
  'aircraftId',
  'operatorId',
]) {
  @ApiProperty({
    type: FlightPilotDto,
    nullable: true,
    description:
      'Pilot checked in for the flight, or null if none has checked in yet',
  })
  pilot!: FlightPilotDto | null;

  @ApiProperty({
    description:
      'Actual fuel burned in tons, captured when the flight is closed; null until then. The planned-vs-actual delta is derived against the loadsheet `fuel.trip`.',
    example: 51.2,
    type: 'number',
    nullable: true,
  })
  actualFuelBurned!: number | null;
}

export class CloseFlightRequest {
  @ApiProperty({
    description: 'Actual fuel burned during the flight in tons',
    example: 51.2,
    required: false,
    nullable: true,
    default: null,
  })
  @IsOptional()
  @IsNumber({ allowNaN: false, allowInfinity: false, maxDecimalPlaces: 3 })
  @Min(0)
  actualFuelBurned?: number | null;
}

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

export class UpdateDepartureParkingPositionRequest {
  @ApiProperty({
    description: 'Departure parking position unique identifier',
    example: 'ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9',
  })
  @IsUUID()
  departureParkingPositionId!: string;
}

export class UpdateDepartureRunwayRequest {
  @ApiProperty({
    description: 'Departure runway unique identifier',
    example: '32121288-2550-4b81-a558-9a7193ef6c97',
  })
  @IsUUID()
  departureRunwayId!: string;
}

export class UpdateArrivalParkingPositionRequest {
  @ApiProperty({
    description: 'Arrival parking position unique identifier',
    example: 'ad5a6ebd-dad8-4400-8bb4-b7cee3b00fa9',
  })
  @IsUUID()
  arrivalParkingPositionId!: string;
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
