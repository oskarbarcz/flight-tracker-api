import { ApiProperty } from '@nestjs/swagger';
import {
  UserTravelStatus,
  UserTravelType,
} from '../../../../prisma/client/enums';

export class UserTravelAirport {
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

export class UserTravel {
  @ApiProperty({
    description: 'Travel unique system identifier',
    example: '3b75f824-84c1-4521-9373-a4f3c27bdd8a',
  })
  id!: string;

  @ApiProperty({
    description: 'User the travel belongs to',
    example: 'fcf6f4bc-290d-43a9-843c-409cd47e143d',
  })
  userId!: string;

  @ApiProperty({
    description: 'How the travel was performed',
    example: 'performing_flight',
    enum: UserTravelType,
  })
  type!: UserTravelType;

  @ApiProperty({
    description: 'Whether the travel is in progress or completed',
    example: 'finished',
    enum: UserTravelStatus,
  })
  status!: UserTravelStatus;

  @ApiProperty({
    description: 'Airport the travel started from',
    type: UserTravelAirport,
  })
  departureAirport!: UserTravelAirport;

  @ApiProperty({
    description: 'Airport the travel ends at',
    type: UserTravelAirport,
  })
  destinationAirport!: UserTravelAirport;

  @ApiProperty({
    description:
      'Great-circle distance between the airports, in nautical miles',
    example: 3326,
  })
  distance!: number;

  @ApiProperty({
    description: 'Flight the travel was performed with, when applicable',
    example: '3b75f824-84c1-4521-9373-a4f3c27bdd8a',
    type: 'string',
    nullable: true,
  })
  flightId!: string | null;

  @ApiProperty({
    description: 'Timestamp when the travel was recorded',
    example: '2025-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: 'Timestamp when the travel was last updated',
    example: '2025-01-01T00:00:00.000Z',
    type: 'string',
    nullable: true,
  })
  updatedAt!: Date | null;
}
