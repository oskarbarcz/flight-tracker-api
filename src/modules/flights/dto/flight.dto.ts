import { ScheduledTimesheet } from '../entity/timesheet.entity';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Operator } from '../../operators/entity/operator.entity';
import { Loadsheets } from '../entity/loadsheet.entity';
import { Type } from 'class-transformer';
import { Flight, FlightPhase, FlightTracking } from '../entity/flight.entity';

class PreliminaryLoadsheetOnly extends OmitType(Loadsheets, ['final']) {}

export class FlightListFilters {
  @IsOptional()
  @IsEnum(FlightPhase)
  phase?: FlightPhase;

  @ApiProperty({
    description: 'Number of page to retrieve',
    example: 1,
    required: false,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    required: false,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}

export class CreateFlightRequest {
  @ApiProperty({
    description: 'Flight number used by ticketing systems',
    example: 'LH450',
  })
  @IsNotEmpty()
  @IsString()
  flightNumber!: string;

  @ApiProperty({
    description: 'Callsign used by air traffic services',
    example: 'DLH450',
  })
  @IsNotEmpty()
  @IsString()
  callsign!: string;

  @ApiProperty({
    description:
      'System unique identifier of the aircraft performing the flight',
    example: 'fe75ec7d-afbe-4514-a935-40c54f475278',
  })
  @IsUUID()
  @IsString()
  aircraftId!: string;

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
    description: 'Flight operator',
    type: Operator,
  })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  operatorId!: string;
}

export class GetFlightResponse extends OmitType(Flight, [
  'rotation',
  'aircraftId',
  'operatorId',
]) {}
