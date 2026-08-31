import { ApiProperty } from '@nestjs/swagger';

export class PlannedRouteFixResponse {
  @ApiProperty({
    description: 'Position of the fix along the route, counting from zero',
    example: 0,
  })
  ordinal!: number;

  @ApiProperty({
    description: 'Identifier the plan gives the fix',
    example: 'TOBAK',
  })
  ident!: string;

  @ApiProperty({
    description: 'Latitude of the fix',
    example: 50.04693,
  })
  latitude!: number;

  @ApiProperty({
    description: 'Longitude of the fix',
    example: 8.57397,
  })
  longitude!: number;

  @ApiProperty({
    description: 'Planned altitude over the fix in feet',
    example: 39000,
  })
  altitude!: number;

  @ApiProperty({
    description: 'Time from departure at which the fix is reached, in seconds',
    example: 1320,
  })
  elapsedSeconds!: number;

  @ApiProperty({
    description:
      'Length of the leg flown to reach the fix in nautical miles, or null where the plan states none',
    example: 86,
    nullable: true,
    type: Number,
  })
  distanceNm!: number | null;

  @ApiProperty({
    description: 'True track flown to reach the fix in degrees',
    example: 284,
    nullable: true,
    type: Number,
  })
  trackTrue!: number | null;

  @ApiProperty({
    description: 'Magnetic track flown to reach the fix in degrees',
    example: 291,
    nullable: true,
    type: Number,
  })
  trackMag!: number | null;

  @ApiProperty({
    description:
      'Airway used to reach the fix, or null where it is reached directly. An oceanic track segment carries the track identifier here.',
    example: 'UZ29',
    nullable: true,
    type: String,
  })
  viaAirway!: string | null;

  @ApiProperty({
    description: 'Stage of flight the fix belongs to',
    example: 'CRZ',
  })
  stage!: string;
}

export class PlannedRouteResponse {
  @ApiProperty({
    description:
      'Route string as the plan files it, or null for a flight not created from a plan',
    example: 'TOBAK1C TOBAK UZ29 SPI UL607 LAMSO UN57 DIGBY',
    nullable: true,
    type: String,
  })
  route!: string | null;

  @ApiProperty({
    description:
      'Planned route fixes in the order they are flown, from the departure airport to the destination. Empty for a flight not created from a plan.',
    type: [PlannedRouteFixResponse],
  })
  fixes!: PlannedRouteFixResponse[];
}
