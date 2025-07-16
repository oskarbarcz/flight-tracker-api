import { ScheduledTimesheet } from '../entity/timesheet.entity';
import { ApiProperty, OmitType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Operator } from '../../operators/entity/operator.entity';
import { Loadsheets } from '../entity/loadsheet.entity';
import { Type } from 'class-transformer';

class PreliminaryLoadsheetOnly extends OmitType(Loadsheets, ['final']) {}

export class CreateFlightRequest {
  @ApiProperty({
    description: 'Flight number used by ticketing systems',
    example: 'LH 450',
  })
  @IsNotEmpty()
  @IsString()
  flightNumber: string;

  @ApiProperty({
    description: 'Callsign used by air traffic services',
    example: 'DLH 450',
  })
  @IsNotEmpty()
  @IsString()
  callsign: string;

  @ApiProperty({
    description:
      'System unique identifier of the aircraft performing the flight',
    example: 'fe75ec7d-afbe-4514-a935-40c54f475278',
  })
  @IsUUID()
  @IsString()
  aircraftId: string;

  @ApiProperty({
    description:
      'System unique identifier of the airport where the flight is departing',
    example: 'fe75ec7d-afbe-4514-a935-40c54f475278',
  })
  @IsUUID()
  @IsString()
  departureAirportId: string;

  @ApiProperty({
    description:
      'System unique identifier of the airport where the flight is arriving',
    example: 'fe75ec7d-afbe-4514-a935-40c54f475278',
  })
  @IsUUID()
  @IsString()
  destinationAirportId: string;

  @ApiProperty({
    description: 'Initial timesheet reported to air traffic control services',
    type: ScheduledTimesheet,
  })
  @IsNotEmpty()
  timesheet: ScheduledTimesheet;

  @ApiProperty({
    description: 'Initial loadsheet filled by operations team for pilots',
    type: PreliminaryLoadsheetOnly,
  })
  @Type(() => PreliminaryLoadsheetOnly)
  @IsNotEmpty()
  loadsheets: PreliminaryLoadsheetOnly;

  @ApiProperty({
    description: 'Flight operator',
    type: Operator,
  })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  operatorId: string;
}
