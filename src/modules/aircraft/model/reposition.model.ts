import { ApiProperty } from '@nestjs/swagger';
import {
  AircraftRepositionStatus,
  AircraftRepositionType,
} from 'prisma/client/enums';

export class RepositionAirport {
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

export class AircraftReposition {
  @ApiProperty({
    description: 'Reposition unique system identifier',
    example: '3b75f824-84c1-4521-9373-a4f3c27bdd8a',
  })
  id!: string;

  @ApiProperty({
    description: 'Aircraft the reposition belongs to',
    example: '9f5da1a4-f09e-4961-8299-82d688337d1f',
  })
  aircraftId!: string;

  @ApiProperty({
    description: 'How the aircraft was repositioned',
    example: 'performing_flight',
    enum: AircraftRepositionType,
  })
  type!: AircraftRepositionType;

  @ApiProperty({
    description: 'Whether the reposition is in progress or completed',
    example: 'finished',
    enum: AircraftRepositionStatus,
  })
  status!: AircraftRepositionStatus;

  @ApiProperty({
    description: 'Airport the reposition started from',
    type: RepositionAirport,
  })
  departureAirport!: RepositionAirport;

  @ApiProperty({
    description: 'Airport the reposition ends at',
    type: RepositionAirport,
  })
  destinationAirport!: RepositionAirport;

  @ApiProperty({
    description:
      'Great-circle distance between the airports, in nautical miles',
    example: 3326,
  })
  distance!: number;

  @ApiProperty({
    description: 'Flight the reposition was performed with, when applicable',
    example: '3b75f824-84c1-4521-9373-a4f3c27bdd8a',
    type: 'string',
    nullable: true,
  })
  flightId!: string | null;

  @ApiProperty({
    description: 'Timestamp when the reposition was recorded',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when the reposition was last updated',
    example: '2025-01-01T00:00:00.000Z',
    type: 'string',
    nullable: true,
  })
  updatedAt!: Date | null;
}
