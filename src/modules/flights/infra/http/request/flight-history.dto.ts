import { ApiProperty } from '@nestjs/swagger';
import { FlightStatus } from '../../../model/flight.model';
import { Schedule } from '../../../model/timesheet.model';

export class FlightHistoryAirport {
  @ApiProperty({
    description: 'Airport unique system identifier',
    example: 'f35c094a-bec5-4803-be32-bd80a14b441a',
  })
  id!: string;

  @ApiProperty({
    description: 'Airport name',
    example: 'Frankfurt Rhein/Main',
  })
  name!: string;

  @ApiProperty({
    description: 'Airport IATA code',
    example: 'FRA',
  })
  iataCode!: string;
}

export class FlightHistoryEntry {
  @ApiProperty({
    description: 'Flight number',
    example: 'LH450',
  })
  flightNumber!: string;

  @ApiProperty({
    description: 'Flight status',
    enum: FlightStatus,
    example: FlightStatus.Closed,
  })
  status!: FlightStatus;

  @ApiProperty({
    description: 'Airport the flight departed from',
    type: FlightHistoryAirport,
  })
  departureAirport!: FlightHistoryAirport;

  @ApiProperty({
    description: 'Airport the flight arrived at',
    type: FlightHistoryAirport,
  })
  arrivalAirport!: FlightHistoryAirport;

  @ApiProperty({
    description: 'Actual times recorded by the crew during the flight',
    type: Schedule,
    nullable: true,
  })
  actualTimesheet!: Partial<Schedule> | null;
}
