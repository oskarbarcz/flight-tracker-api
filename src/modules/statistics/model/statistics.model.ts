import { ApiProperty } from '@nestjs/swagger';

export class LifetimeTotalsLegacy {
  @ApiProperty({ example: 3760, deprecated: true })
  blockTime!: number;

  @ApiProperty({ description: 'Lifetime block time in minutes', example: 3760 })
  totalFlightTime!: number;

  @ApiProperty({ description: 'Lifetime fuel burned in kg', example: 326000 })
  totalFuelBurned!: number;

  @ApiProperty({
    description: 'Lifetime great-circle distance in nautical miles',
    example: 7850,
  })
  totalGreatCircleDistance!: number;
}

export class GetUserStatsResponse {
  @ApiProperty({ type: LifetimeTotalsLegacy })
  total!: LifetimeTotalsLegacy;
}

export class LifetimeTotals {
  @ApiProperty({ example: 7850 })
  distanceNm!: number;

  @ApiProperty({ example: 3600 })
  airborneMinutes!: number;

  @ApiProperty({ example: 3760 })
  blockMinutes!: number;

  @ApiProperty({ example: 42 })
  flights!: number;

  @ApiProperty({
    description: 'One completed sector counts as one cycle',
    example: 42,
  })
  cycles!: number;

  @ApiProperty({ example: 326000 })
  fuelBurned!: number;
}

export class LifetimeRecords {
  @ApiProperty({ example: 4500 })
  longestFlightDistanceNm!: number;

  @ApiProperty({ example: 610 })
  longestFlightMinutes!: number;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '2024-01-05T12:00:00.000Z',
  })
  firstFlightAt!: Date | null;

  @ApiProperty({
    type: String,
    nullable: true,
    example: '2026-07-20T18:30:00.000Z',
  })
  lastFlightAt!: Date | null;
}

export class MostFlownAirline {
  @ApiProperty()
  operatorId!: string;

  @ApiProperty({ example: 'DLH' })
  icaoCode!: string;

  @ApiProperty({ example: 'Lufthansa' })
  shortName!: string;

  @ApiProperty({ example: 'Deutsche Lufthansa AG' })
  fullName!: string;

  @ApiProperty({ type: String, nullable: true })
  logoUrl!: string | null;
}

export class MostVisitedAirport {
  @ApiProperty()
  airportId!: string;

  @ApiProperty({ example: 'EDDF' })
  icaoCode!: string;

  @ApiProperty({ example: 'Frankfurt Airport' })
  name!: string;

  @ApiProperty({ example: 'Frankfurt' })
  city!: string;

  @ApiProperty({ example: 'Germany' })
  country!: string;

  @ApiProperty({ example: 27 })
  visits!: number;
}

export class GeographySummary {
  @ApiProperty({ example: 18 })
  airports!: number;

  @ApiProperty({ example: 9 })
  countries!: number;

  @ApiProperty({ example: 3 })
  continents!: number;

  @ApiProperty({ type: MostVisitedAirport, nullable: true })
  mostVisitedAirport!: MostVisitedAirport | null;
}

export class GetUserStatsSummaryResponse {
  @ApiProperty({ type: LifetimeTotals })
  totals!: LifetimeTotals;

  @ApiProperty({ type: LifetimeRecords })
  records!: LifetimeRecords;

  @ApiProperty({ type: String, nullable: true, example: 'A320' })
  mostFlownAircraftType!: string | null;

  @ApiProperty({ type: MostFlownAirline, nullable: true })
  mostFlownAirline!: MostFlownAirline | null;

  @ApiProperty({ type: GeographySummary })
  geography!: GeographySummary;
}

export class AircraftTypeStat {
  @ApiProperty({ example: 'A320' })
  type!: string;

  @ApiProperty({ example: 21 })
  flights!: number;

  @ApiProperty({ example: 3900 })
  distanceNm!: number;

  @ApiProperty({ example: 1800 })
  airborneMinutes!: number;

  @ApiProperty({ example: 1980 })
  blockMinutes!: number;

  @ApiProperty({ type: String, example: '2024-01-05T12:00:00.000Z' })
  firstFlownAt!: Date;

  @ApiProperty({ type: String, example: '2026-07-20T18:30:00.000Z' })
  lastFlownAt!: Date;
}

export class GetAircraftTypeStatsResponse {
  @ApiProperty({ type: [AircraftTypeStat] })
  types!: AircraftTypeStat[];
}

export class PeriodTotals {
  @ApiProperty({ example: 980 })
  distanceNm!: number;

  @ApiProperty({ example: 420 })
  airborneMinutes!: number;

  @ApiProperty({ example: 460 })
  blockMinutes!: number;

  @ApiProperty({ example: 6 })
  flights!: number;

  @ApiProperty({ example: 48000 })
  fuelBurned!: number;
}

export class PeriodUnlocked {
  @ApiProperty({ type: [String], example: ['LFPG', 'LEBL'] })
  airports!: string[];

  @ApiProperty({ type: [String], example: ['B738'] })
  aircraftTypes!: string[];
}

export class PeriodComparison {
  @ApiProperty({ type: PeriodTotals })
  current!: PeriodTotals;

  @ApiProperty({ type: PeriodTotals })
  previous!: PeriodTotals;

  @ApiProperty({ type: PeriodUnlocked })
  unlocked!: PeriodUnlocked;
}

export class GetPeriodStatsResponse {
  @ApiProperty({ type: PeriodComparison })
  week!: PeriodComparison;

  @ApiProperty({ type: PeriodComparison })
  month!: PeriodComparison;

  @ApiProperty({ type: PeriodComparison })
  year!: PeriodComparison;
}

export class ActivityDay {
  @ApiProperty({ example: '2026-07-20' })
  day!: string;

  @ApiProperty({ example: 2 })
  flights!: number;

  @ApiProperty({ example: 210 })
  airborneMinutes!: number;

  @ApiProperty({ example: 240 })
  blockMinutes!: number;
}

export class GetActivityResponse {
  @ApiProperty({ type: [ActivityDay] })
  days!: ActivityDay[];
}
