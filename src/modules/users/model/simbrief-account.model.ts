import { ApiProperty } from '@nestjs/swagger';

export class SimbriefAirport {
  @ApiProperty({
    description: 'ICAO code of the airport',
    example: 'EGLL',
  })
  icaoCode!: string;

  @ApiProperty({
    description: 'IATA code of the airport',
    example: 'LHR',
    type: 'string',
    nullable: true,
  })
  iataCode!: string | null;

  @ApiProperty({
    description: 'Airport name as SimBrief reports it',
    example: 'HEATHROW',
    type: 'string',
    nullable: true,
  })
  name!: string | null;
}

export class SimbriefAircraft {
  @ApiProperty({
    description: 'Registration of the planned aircraft',
    example: 'G-YMMG',
    type: 'string',
    nullable: true,
  })
  registration!: string | null;

  @ApiProperty({
    description: 'ICAO type designator of the planned aircraft',
    example: 'B772',
    type: 'string',
    nullable: true,
  })
  type!: string | null;

  @ApiProperty({
    description: 'Aircraft name as SimBrief reports it',
    example: 'B777-200ER',
    type: 'string',
    nullable: true,
  })
  name!: string | null;
}

export class SimbriefFlight {
  @ApiProperty({
    description: 'Callsign built from the airline ICAO code and flight number',
    example: 'BAW0229',
  })
  callsign!: string;

  @ApiProperty({ type: SimbriefAirport })
  origin!: SimbriefAirport;

  @ApiProperty({ type: SimbriefAirport })
  destination!: SimbriefAirport;

  @ApiProperty({ type: SimbriefAircraft })
  aircraft!: SimbriefAircraft;

  @ApiProperty({
    description: 'Scheduled off-block time of the planned flight',
    example: '2026-08-18T09:27:00.000Z',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  scheduledOffBlockTime!: Date | null;

  @ApiProperty({
    description: 'Scheduled on-block time of the planned flight',
    example: '2026-08-18T17:42:00.000Z',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  scheduledOnBlockTime!: Date | null;

  @ApiProperty({
    description: 'When the flight plan was generated in SimBrief',
    example: '2026-08-18T08:21:57.000Z',
    type: 'string',
    format: 'date-time',
    nullable: true,
  })
  generatedAt!: Date | null;
}

export class SimbriefAccount {
  @ApiProperty({
    description: 'SimBrief user ID the account was resolved for',
    example: '123456',
  })
  simbriefUserId!: string;

  @ApiProperty({
    description: 'Most recent flight plan generated on the account',
    type: SimbriefFlight,
  })
  latestFlight!: SimbriefFlight;
}
