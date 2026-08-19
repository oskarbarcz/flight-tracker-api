import { ApiProperty } from '@nestjs/swagger';
import {
  AerolopaAssets,
  AerolopaCabin,
  AerolopaSeatComment,
} from '../../../core/provider/aerolopa/type/aerolopa.types';
import { CabinDeckName } from './layout-version';

export class CabinSeatMapCanvas {
  @ApiProperty({ example: 800 })
  width!: number;

  @ApiProperty({ example: 5239 })
  height!: number;
}

export class CabinSeat {
  @ApiProperty({ example: '01A' })
  designator!: string;

  @ApiProperty({
    description:
      'Left edge in the coordinate space of the deck this seat is on',
    example: 177.9,
  })
  x!: number;

  @ApiProperty({ example: 849.5 })
  y!: number;

  @ApiProperty({ example: 57.3 })
  width!: number;

  @ApiProperty({ example: 77.2 })
  height!: number;

  @ApiProperty({ description: 'Degrees, clockwise positive', example: 0 })
  rotation!: number;

  @ApiProperty({ example: false })
  reversed!: boolean;

  @ApiProperty({
    description:
      'Commercial cabin of this seat, which on a flexible cabin may disagree with the cabin descriptions',
    example: 'business',
  })
  cabin!: string;

  @ApiProperty({
    description: "AeroLOPA's verdict on the seat; null when it has none",
    example: 'red',
    nullable: true,
  })
  rating!: string | null;

  @ApiProperty({ example: '#dc3c3c' })
  color!: string;

  @ApiProperty({ example: true })
  bookable!: boolean;

  @ApiProperty({ example: false })
  blocked!: boolean;

  @ApiProperty({ example: false })
  crewRest!: boolean;

  @ApiProperty({
    description: 'Window alignment; null when the seat has no window position',
    example: 'great',
    nullable: true,
  })
  windowStatus!: string | null;

  @ApiProperty({ example: null, nullable: true })
  seatProduct!: string | null;

  @ApiProperty({ isArray: true, type: Object })
  comments!: AerolopaSeatComment[];
}

export class CabinSeatMapDeck {
  @ApiProperty({ enum: ['main', 'upper'], example: 'main' })
  deck!: CabinDeckName;

  @ApiProperty({
    description: 'AeroLOPA identifier this deck was read from',
    example: 'lh-74h-m',
  })
  sourceSlug!: string;

  @ApiProperty({
    description: 'Coordinate space the seats of this deck are positioned in',
    type: CabinSeatMapCanvas,
  })
  canvas!: CabinSeatMapCanvas;

  @ApiProperty({ example: 332 })
  seatCount!: number;

  @ApiProperty({ example: '2025-03-31' })
  lastUpdated!: string;

  @ApiProperty({ type: Object })
  assets!: AerolopaAssets;

  @ApiProperty({ isArray: true, type: Object })
  cabins!: AerolopaCabin[];

  @ApiProperty({ type: CabinSeat, isArray: true })
  seats!: CabinSeat[];
}

export class CabinSeatMap {
  @ApiProperty({ example: 'lh-74h' })
  layoutId!: string;

  @ApiProperty({ example: 'LH' })
  airlineIata!: string;

  @ApiProperty({ example: '74H' })
  aircraftIata!: string;

  @ApiProperty({
    description: 'Revision of this layout the seats were read from',
    example: 1,
  })
  revision!: number;

  @ApiProperty({ example: 'Boeing 747-8' })
  aircraftType!: string;

  @ApiProperty({ example: 'Boeing 747-8' })
  aircraftTypeDisplayed!: string;

  @ApiProperty({ example: 'Boeing' })
  manufacturer!: string;

  @ApiProperty({ example: 'Long Haul' })
  haulType!: string;

  @ApiProperty({ example: true })
  isDualDeck!: boolean;

  @ApiProperty({
    description: 'Seats across every deck of the aircraft',
    example: 364,
  })
  totalSeats!: number;

  @ApiProperty({ type: Object })
  seatCounts!: Record<string, number>;

  @ApiProperty({
    description: 'Most recent revision date AeroLOPA reports across the decks',
    example: '2025-03-31',
  })
  lastUpdated!: string;

  @ApiProperty({ example: '2026-08-19T09:12:44.000Z' })
  fetchedAt!: Date;

  @ApiProperty({ type: CabinSeatMapDeck, isArray: true })
  decks!: CabinSeatMapDeck[];
}

export class CabinLayoutRefreshResult {
  @ApiProperty({ example: 'lh-74h' })
  layoutId!: string;

  @ApiProperty({
    description: 'Whether the cabin differed from the newest stored revision',
    example: false,
  })
  changed!: boolean;

  @ApiProperty({
    description: 'Revision in force after the refresh',
    example: 1,
  })
  revision!: number;
}
