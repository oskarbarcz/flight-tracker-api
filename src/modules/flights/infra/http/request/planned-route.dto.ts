import { ApiProperty } from '@nestjs/swagger';

export class PlannedRouteFuelResponse {
  @ApiProperty({
    description:
      'Fuel flow planned over the fix in kilograms per hour, or null where the plan states none',
    example: 7719,
    nullable: true,
    type: Number,
  })
  flow!: number | null;

  @ApiProperty({
    description:
      'Fuel burned on the leg flown to reach the fix in kilograms, or null where the plan states none',
    example: 4022,
    nullable: true,
    type: Number,
  })
  leg!: number | null;

  @ApiProperty({
    description:
      'Fuel burned from departure up to the fix in kilograms, or null where the plan states none',
    example: 47458,
    nullable: true,
    type: Number,
  })
  used!: number | null;

  @ApiProperty({
    description:
      'Fuel that must remain on board over the fix in kilograms, or null where the plan states none',
    example: 45611,
    nullable: true,
    type: Number,
  })
  minimumOnBoard!: number | null;

  @ApiProperty({
    description:
      'Fuel planned to remain on board over the fix in kilograms, or null where the plan states none',
    example: 48194,
    nullable: true,
    type: Number,
  })
  plannedOnBoard!: number | null;
}

export class PlannedRouteWindLevelResponse {
  @ApiProperty({
    description: 'Altitude the wind is forecast for, in feet',
    example: 35000,
  })
  altitude!: number;

  @ApiProperty({
    description: 'Direction the wind blows from in degrees true',
    example: 108,
  })
  direction!: number;

  @ApiProperty({
    description: 'Wind speed in knots',
    example: 20,
  })
  speed!: number;

  @ApiProperty({
    description: 'Outside air temperature in degrees Celsius',
    example: -43,
  })
  oat!: number;
}

export class PlannedRouteWindResponse {
  @ApiProperty({
    description:
      'Direction the wind blows from at the planned altitude, in degrees true, or null where the plan states none',
    example: 108,
    nullable: true,
    type: Number,
  })
  direction!: number | null;

  @ApiProperty({
    description:
      'Wind speed at the planned altitude in knots, or null where the plan states none',
    example: 20,
    nullable: true,
    type: Number,
  })
  speed!: number | null;

  @ApiProperty({
    description:
      'Wind and temperature forecast over the fix by altitude, lowest first. Empty where the plan carries no profile.',
    type: [PlannedRouteWindLevelResponse],
  })
  levels!: PlannedRouteWindLevelResponse[];
}

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

  @ApiProperty({
    description: 'Fuel planned over the fix',
    type: PlannedRouteFuelResponse,
  })
  fuel!: PlannedRouteFuelResponse;

  @ApiProperty({
    description:
      'Outside air temperature forecast over the fix in degrees Celsius, or null where the plan states none',
    example: -43,
    nullable: true,
    type: Number,
  })
  oat!: number | null;

  @ApiProperty({
    description:
      'Deviation of the forecast temperature from the standard atmosphere in degrees Celsius, or null where the plan states none',
    example: 12,
    nullable: true,
    type: Number,
  })
  isaDeviation!: number | null;

  @ApiProperty({
    description:
      'Height of the tropopause over the fix in feet, or null where the plan states none',
    example: 54300,
    nullable: true,
    type: Number,
  })
  tropopause!: number | null;

  @ApiProperty({
    description:
      'Minimum off-route altitude for the grid area the fix lies in, in feet, or null where the plan states none',
    example: 5300,
    nullable: true,
    type: Number,
  })
  mora!: number | null;

  @ApiProperty({
    description:
      'Flight information region the fix lies in, or null where the plan states none',
    example: 'GOOO',
    nullable: true,
    type: String,
  })
  fir!: string | null;

  @ApiProperty({
    description: 'Wind forecast over the fix',
    type: PlannedRouteWindResponse,
  })
  wind!: PlannedRouteWindResponse;
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
      'Route as filed with air traffic control, carrying the speed and level changes the flight plan requests. Null for a flight not created from a plan.',
    example:
      'N0490F350 TOBAK1C TOBAK UZ29 SPI/N0486F370 UL607 LAMSO UN57 DIGBY',
    nullable: true,
    type: String,
  })
  atcRoute!: string | null;

  @ApiProperty({
    description:
      'Planned route fixes in the order they are flown, from the departure airport to the destination. Empty for a flight not created from a plan.',
    type: [PlannedRouteFixResponse],
  })
  fixes!: PlannedRouteFixResponse[];
}
