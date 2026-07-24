import type { CaptainFlightFact } from '../../flights/infra/database/repository/flights.repository';
import type { Continent } from '../../../../prisma/client/client';
import { startOfUtcDay } from './period';

export type TotalProjection = {
  flights: number;
  distanceNm: number;
  airborneMinutes: number;
  blockMinutes: number;
  fuelBurned: number;
  longestFlightDistanceNm: number;
  longestFlightMinutes: number;
  firstFlightAt: Date | null;
  lastFlightAt: Date | null;
  mostFlownOperatorId: string | null;
};

export type TypeProjection = {
  type: string;
  flights: number;
  distanceNm: number;
  airborneMinutes: number;
  blockMinutes: number;
  firstFlownAt: Date;
  lastFlownAt: Date;
};

export type AirportProjection = {
  airportId: string;
  icaoCode: string;
  country: string;
  continent: Continent;
  visits: number;
  firstVisitAt: Date;
  lastVisitAt: Date;
};

export type DailyProjection = {
  day: Date;
  flights: number;
  distanceNm: number;
  airborneMinutes: number;
  blockMinutes: number;
  fuelBurned: number;
};

export type UserStatsProjection = {
  total: TotalProjection;
  byType: TypeProjection[];
  byAirport: AirportProjection[];
  daily: DailyProjection[];
};

const min = (a: Date, b: Date): Date => (a.getTime() <= b.getTime() ? a : b);
const max = (a: Date, b: Date): Date => (a.getTime() >= b.getTime() ? a : b);

export function computeProjections(
  facts: CaptainFlightFact[],
): UserStatsProjection {
  const total: TotalProjection = {
    flights: 0,
    distanceNm: 0,
    airborneMinutes: 0,
    blockMinutes: 0,
    fuelBurned: 0,
    longestFlightDistanceNm: 0,
    longestFlightMinutes: 0,
    firstFlightAt: null,
    lastFlightAt: null,
    mostFlownOperatorId: null,
  };

  const byType = new Map<string, TypeProjection>();
  const byAirport = new Map<string, AirportProjection>();
  const daily = new Map<string, DailyProjection>();
  const operatorCounts = new Map<string, number>();

  for (const fact of facts) {
    const airborne = fact.airborneMinutes ?? 0;
    const block = fact.blockMinutes ?? 0;

    total.flights += 1;
    total.distanceNm += fact.greatCircleDistance;
    total.airborneMinutes += airborne;
    total.blockMinutes += block;
    total.fuelBurned += fact.fuelBurned;
    total.longestFlightDistanceNm = Math.max(
      total.longestFlightDistanceNm,
      fact.greatCircleDistance,
    );
    total.longestFlightMinutes = Math.max(total.longestFlightMinutes, airborne);
    total.firstFlightAt = total.firstFlightAt
      ? min(total.firstFlightAt, fact.completedAt)
      : fact.completedAt;
    total.lastFlightAt = total.lastFlightAt
      ? max(total.lastFlightAt, fact.completedAt)
      : fact.completedAt;

    operatorCounts.set(
      fact.operatorId,
      (operatorCounts.get(fact.operatorId) ?? 0) + 1,
    );

    const type = byType.get(fact.aircraftType);
    if (type) {
      type.flights += 1;
      type.distanceNm += fact.greatCircleDistance;
      type.airborneMinutes += airborne;
      type.blockMinutes += block;
      type.firstFlownAt = min(type.firstFlownAt, fact.completedAt);
      type.lastFlownAt = max(type.lastFlownAt, fact.completedAt);
    } else {
      byType.set(fact.aircraftType, {
        type: fact.aircraftType,
        flights: 1,
        distanceNm: fact.greatCircleDistance,
        airborneMinutes: airborne,
        blockMinutes: block,
        firstFlownAt: fact.completedAt,
        lastFlownAt: fact.completedAt,
      });
    }

    for (const airport of fact.airports) {
      const seen = byAirport.get(airport.airportId);
      if (seen) {
        seen.visits += 1;
        seen.firstVisitAt = min(seen.firstVisitAt, fact.completedAt);
        seen.lastVisitAt = max(seen.lastVisitAt, fact.completedAt);
      } else {
        byAirport.set(airport.airportId, {
          airportId: airport.airportId,
          icaoCode: airport.icaoCode,
          country: airport.country,
          continent: airport.continent,
          visits: 1,
          firstVisitAt: fact.completedAt,
          lastVisitAt: fact.completedAt,
        });
      }
    }

    const dayKey = startOfUtcDay(fact.completedAt);
    const dayId = dayKey.toISOString();
    const day = daily.get(dayId);
    if (day) {
      day.flights += 1;
      day.distanceNm += fact.greatCircleDistance;
      day.airborneMinutes += airborne;
      day.blockMinutes += block;
      day.fuelBurned += fact.fuelBurned;
    } else {
      daily.set(dayId, {
        day: dayKey,
        flights: 1,
        distanceNm: fact.greatCircleDistance,
        airborneMinutes: airborne,
        blockMinutes: block,
        fuelBurned: fact.fuelBurned,
      });
    }
  }

  total.mostFlownOperatorId = pickTopKey(operatorCounts);

  return {
    total,
    byType: [...byType.values()],
    byAirport: [...byAirport.values()],
    daily: [...daily.values()],
  };
}

function pickTopKey(counts: Map<string, number>): string | null {
  let topKey: string | null = null;
  let topCount = -1;
  for (const [key, count] of counts) {
    if (
      count > topCount ||
      (count === topCount && topKey !== null && key < topKey)
    ) {
      topKey = key;
      topCount = count;
    }
  }
  return topKey;
}
