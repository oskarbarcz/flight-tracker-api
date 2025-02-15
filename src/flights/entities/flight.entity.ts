import { ApiProperty } from '@nestjs/swagger';
import { AirportWithType } from '../../airports/entities/airport.entity';
import { FullTimesheet } from './timesheet.entity';
import { CreateAircraftResponse } from '../../aircraft/dto/create-aircraft.dto';
import { Operator } from '../../operators/entities/operator.entity';
import { Loadsheets } from './loadsheet.entity';

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

export class Flight {
  @ApiProperty({
    description: 'Flight unique system identifier',
    example: 'bd8f2d64-a647-42da-be63-c6589915e6c9',
  })
  id: string;

  @ApiProperty({
    description: 'Flight number used by ticketing systems',
    example: 'LH 450',
  })
  flightNumber: string;

  @ApiProperty({
    description: 'Callsign used by air traffic services',
    example: 'DLH 450',
  })
  callsign: string;

  @ApiProperty({
    description: 'Flight status',
    example: FlightStatus.Created,
    enum: FlightStatus,
  })
  status: FlightStatus;

  @ApiProperty({
    description: 'Aircraft reported for flight',
  })
  aircraft: CreateAircraftResponse;

  @ApiProperty({
    description: 'Airports related to the flight',
  })
  airports: AirportWithType[];

  @ApiProperty({
    description: 'Timesheet',
  })
  timesheet: FullTimesheet;

  @ApiProperty({
    description: 'Loadsheets',
    type: Loadsheets,
  })
  loadsheets: Loadsheets;

  @ApiProperty({
    description: 'Flight operator',
    type: Operator,
  })
  operator: Operator;
}
