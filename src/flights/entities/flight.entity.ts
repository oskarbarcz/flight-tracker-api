import { ApiProperty } from '@nestjs/swagger';
import { AirportWithType } from '../../airports/entities/airport.entity';
import { Aircraft } from '../../aircraft/entities/aircraft.entity';
import { FullTimesheet } from './timesheet.entity';

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
    example: 'ready',
  })
  status: string;

  @ApiProperty({
    description: 'Aircraft reported for flight',
  })
  aircraft: Aircraft;

  @ApiProperty({
    description: 'Airports related to the flight',
  })
  airports: AirportWithType[];

  @ApiProperty({
    description: 'Timesheet',
  })
  timesheet: FullTimesheet;
}
