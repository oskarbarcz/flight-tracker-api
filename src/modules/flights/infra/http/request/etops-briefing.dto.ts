import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  EtopsAirportResponse,
  EtopsPointResponse,
} from '../../../model/etops.model';
import { PlannedRouteResponse } from './planned-route.dto';
import { FlightOceanicCrossingResponse } from './oceanic-crossing.dto';

export class EtopsPlanResponse {
  @ApiPropertyOptional({
    description: 'Diversion time the ETOPS rule allows, in minutes',
    example: 370,
    nullable: true,
    type: Number,
  })
  ruleMinutes!: number | null;

  @ApiPropertyOptional({
    description:
      'Radius of the rule ring around each suitable airport, in nautical miles, ready to draw',
    example: 2694.833,
    nullable: true,
    type: Number,
  })
  ruleRadiusNm!: number | null;

  @ApiPropertyOptional({
    description: 'Diversion time at which ETOPS begins, in minutes',
    example: 60,
    nullable: true,
    type: Number,
  })
  thresholdMinutes!: number | null;

  @ApiPropertyOptional({
    description:
      'Radius of the threshold ring, in nautical miles, ready to draw. Derived from the rule radius so no client recomputes it.',
    example: 437.0,
    nullable: true,
    type: Number,
  })
  thresholdRadiusNm!: number | null;

  @ApiProperty({
    description:
      'Every point the plan publishes — entry, exit, equal-time and critical — each positioned',
    type: [EtopsPointResponse],
  })
  points!: EtopsPointResponse[];

  @ApiProperty({
    description:
      'Airports the flight may divert to, with the window each must be usable for and the conditions forecast for that window. Suitability is not asserted as a verdict.',
    type: [EtopsAirportResponse],
  })
  airports!: EtopsAirportResponse[];
}

export class EtopsBriefingResponse {
  @ApiPropertyOptional({
    description:
      'The ETOPS plan, or null for a flight imported from a plan that does not fly ETOPS',
    type: EtopsPlanResponse,
    nullable: true,
  })
  etops!: EtopsPlanResponse | null;

  @ApiProperty({
    description: 'The planned route, airport to airport, every fix positioned',
    type: PlannedRouteResponse,
  })
  route!: PlannedRouteResponse;

  @ApiProperty({
    description:
      'The oceanic track message the flight was planned against, and how the flight relates to it',
    type: FlightOceanicCrossingResponse,
  })
  oceanicCrossing!: FlightOceanicCrossingResponse;
}
