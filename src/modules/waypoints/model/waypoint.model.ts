import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Coordinates } from '../../airports/model/airport.model';

export enum WaypointKind {
  Waypoint = 'waypoint',
  Navaid = 'navaid',
}

export type HarvestedWaypoint = {
  ident: string;
  icaoRegion: string | null;
  kind: WaypointKind;
  latitude: number;
  longitude: number;
  frequency: number | null;
};

export class WaypointResponse {
  @ApiProperty({
    description: 'Waypoint unique identifier',
    example: 'c8d0f5a1-2b3c-4d5e-8f90-1a2b3c4d5e6f',
  })
  id!: string;

  @ApiProperty({
    description: 'Published identifier of the waypoint',
    example: 'MALOT',
  })
  ident!: string;

  @ApiPropertyOptional({
    description:
      'ICAO region the waypoint belongs to. Identifiers are not unique worldwide, so this qualifies them. Oceanic track fixes are published without one.',
    example: 'SB',
    nullable: true,
    type: String,
  })
  icaoRegion!: string | null;

  @ApiProperty({
    description: 'Whether the waypoint is a plain waypoint or a radio navaid',
    enum: WaypointKind,
    example: WaypointKind.Waypoint,
  })
  kind!: WaypointKind;

  @ApiProperty({
    description: 'Position of the waypoint',
    type: Coordinates,
  })
  location!: Coordinates;

  @ApiPropertyOptional({
    description: 'Radio frequency, where the waypoint is a navaid',
    example: 116.9,
    nullable: true,
    type: Number,
  })
  frequency!: number | null;

  @ApiProperty({
    description: 'When a flight plan last published this waypoint',
    type: String,
    format: 'date-time',
  })
  lastSeenAt!: Date;
}
