import { ApiProperty } from '@nestjs/swagger';

export class LegAirport {
  @ApiProperty({ example: 'bd8f2d64-a647-42da-be63-c6589915e6c9' })
  id!: string;

  @ApiProperty({ example: 'LHR' })
  iataCode!: string;

  @ApiProperty({ example: 'EGLL' })
  icaoCode!: string;

  @ApiProperty({ example: 'London Heathrow' })
  name!: string;
}

export class LegFlight {
  @ApiProperty({ example: 'bd8f2d64-a647-42da-be63-c6589915e6c9' })
  id!: string;

  @ApiProperty({ example: 'BA117' })
  flightNumber!: string;

  @ApiProperty({ example: 'created' })
  status!: string;
}

export class RotationLeg {
  @ApiProperty({ example: 'bd8f2d64-a647-42da-be63-c6589915e6c9' })
  id!: string;

  @ApiProperty({
    description: 'Planned flight number for this leg',
    example: 'LH450',
  })
  flightNumber!: string;

  @ApiProperty({ type: LegAirport })
  departure!: LegAirport;

  @ApiProperty({ type: LegAirport })
  arrival!: LegAirport;

  @ApiProperty({ example: '2025-01-01T10:00:00.000Z' })
  offBlockTime!: Date;

  @ApiProperty({ example: '2025-01-01T11:35:00.000Z' })
  onBlockTime!: Date;

  @ApiProperty({
    description: 'Planned block time in minutes (on-block minus off-block)',
    example: 95,
  })
  blockTime!: number;

  @ApiProperty({ type: LegFlight, nullable: true })
  flight!: LegFlight | null;
}
