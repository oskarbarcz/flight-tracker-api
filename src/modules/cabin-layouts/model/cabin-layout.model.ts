import { ApiProperty } from '@nestjs/swagger';

export class CabinLayout {
  @ApiProperty({
    description: 'AeroLOPA layout identifier, with any deck marker removed',
    example: 'lh-74h',
  })
  id!: string;

  @ApiProperty({ description: 'Airline IATA code', example: 'LH' })
  airlineIata!: string;

  @ApiProperty({ description: 'Aircraft IATA type code', example: '74H' })
  aircraftIata!: string;

  @ApiProperty({
    description:
      'Discriminator separating several layouts of one airline and aircraft type; null when the pair has only one',
    example: '2',
    nullable: true,
  })
  variant!: string | null;

  @ApiProperty({
    description:
      'Upstream identifiers this layout was assembled from; two for a double-deck aircraft, one otherwise',
    example: ['lh-74h-m', 'lh-74h-u'],
    isArray: true,
    type: String,
  })
  sourceSlugs!: string[];

  @ApiProperty({ example: '2026-08-19T09:12:44.000Z' })
  firstSeenAt!: Date;

  @ApiProperty({
    description: 'When AeroLOPA stopped publishing this layout',
    example: null,
    nullable: true,
  })
  retiredAt!: Date | null;
}

export class CabinLayoutSyncResult {
  @ApiProperty({ description: 'Layouts the provider reported', example: 1601 })
  reported!: number;

  @ApiProperty({
    description: 'Layouts held after merging deck pairs',
    example: 1566,
  })
  catalogued!: number;

  @ApiProperty({ example: 12 })
  created!: number;

  @ApiProperty({ example: 3 })
  retired!: number;

  @ApiProperty({
    description: 'Layouts that had been retired and are published again',
    example: 1,
  })
  restored!: number;

  @ApiProperty({
    description:
      'Provider entries that could not be read as a layout identifier and were ignored',
    example: 0,
  })
  skipped!: number;
}
