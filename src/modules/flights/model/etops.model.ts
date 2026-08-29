import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum EtopsPointKind {
  Entry = 'entry',
  Exit = 'exit',
  EqualTime = 'equal_time',
  Critical = 'critical',
}

export type EtopsPointPosition = {
  latitude: number;
  longitude: number;
};

export type EtopsDiversionAirportSnapshot = {
  airportId: string;
  ordinal: number;
};

export type EtopsPointSnapshot = {
  kind: EtopsPointKind;
  ordinal: number;
  isCritical: boolean;
  adequateAirportId: string | null;
  position: EtopsPointPosition;
  elapsedSeconds: number;
  condition: string | null;
  diversionAirports: EtopsDiversionAirportSnapshot[];
};

export type EtopsAirportSnapshot = {
  airportId: string;
  suitabilityStart: Date;
  suitabilityEnd: Date;
  plannedRunway: string | null;
  forecastCeiling: number | null;
  forecastVisibility: number | null;
  transitionAltitude: number | null;
  transitionLevel: number | null;
};

export type EtopsRings = {
  ruleMinutes: number | null;
  ruleDistanceNm: number | null;
  thresholdMinutes: number | null;
};

export type EtopsSnapshot = {
  rings: EtopsRings;
  points: EtopsPointSnapshot[];
  airports: EtopsAirportSnapshot[];
};

export class EtopsDiversionAirportResponse {
  @ApiProperty({
    description: 'Airport the point would divert to',
    example: 'fa8ee2e9-fb94-4416-9ed0-4811efd488ae',
  })
  airportId!: string;

  @ApiProperty({
    description:
      'Order of this airport at the point. An equal-time point names two, one on each side.',
    example: 1,
  })
  ordinal!: number;
}

export class EtopsPointResponse {
  @ApiProperty({
    description: 'Which ETOPS point this is',
    enum: EtopsPointKind,
    example: EtopsPointKind.EqualTime,
  })
  kind!: EtopsPointKind;

  @ApiProperty({
    description:
      'Order among points of the same kind, as the plan numbers them. A plan may carry more than one equal-time point.',
    example: 1,
  })
  ordinal!: number;

  @ApiProperty({
    description:
      'Whether this is the point the plan names as critical for fuel requirements',
    example: true,
  })
  isCritical!: boolean;

  @ApiPropertyOptional({
    description:
      'Adequate airport defining the threshold at this point. An equal-time point has none.',
    example: '6cf1fcd8-d072-46b5-8132-bd885b43dd97',
    nullable: true,
  })
  adequateAirportId!: string | null;

  @ApiProperty({
    description: 'Position of the point itself, not of any airport near it',
    example: { latitude: 52.095985, longitude: -33.466877 },
  })
  position!: EtopsPointPosition;

  @ApiProperty({
    description: 'Seconds from departure at which the point is reached',
    example: 12186,
  })
  elapsedSeconds!: number;

  @ApiPropertyOptional({
    description:
      'Condition the plan assumes for the diversion, as published. The provider does not document its code set.',
    example: 'DC',
    nullable: true,
  })
  condition!: string | null;

  @ApiProperty({
    description: 'Airports this point would divert to',
    type: [EtopsDiversionAirportResponse],
  })
  diversionAirports!: EtopsDiversionAirportResponse[];
}

export class EtopsAirportResponse {
  @ApiProperty({
    description: 'Airport the flight could divert to',
    example: 'fa8ee2e9-fb94-4416-9ed0-4811efd488ae',
  })
  airportId!: string;

  @ApiProperty({
    description: 'Start of the period the airport must be usable',
    type: String,
    format: 'date-time',
  })
  suitabilityStart!: Date;

  @ApiProperty({
    description: 'End of the period the airport must be usable',
    type: String,
    format: 'date-time',
  })
  suitabilityEnd!: Date;

  @ApiPropertyOptional({
    description: 'Runway the plan assumes for a diversion here',
    example: '21',
    nullable: true,
  })
  plannedRunway!: string | null;

  @ApiPropertyOptional({
    description: 'Ceiling forecast for the suitability window, in feet',
    example: 900,
    nullable: true,
  })
  forecastCeiling!: number | null;

  @ApiPropertyOptional({
    description: 'Visibility forecast for the suitability window, in metres',
    example: 8050,
    nullable: true,
  })
  forecastVisibility!: number | null;

  @ApiPropertyOptional({
    description: 'Transition altitude in feet',
    example: 18000,
    nullable: true,
  })
  transitionAltitude!: number | null;

  @ApiPropertyOptional({
    description: 'Transition level in feet',
    example: 18000,
    nullable: true,
  })
  transitionLevel!: number | null;
}
