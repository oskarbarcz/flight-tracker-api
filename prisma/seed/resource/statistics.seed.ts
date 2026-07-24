import { Prisma } from '../../client/client';
import { computeProjections } from '../../../src/modules/statistics/model/compute-projections';
import { minutesBetween } from '../../../src/modules/flights/infra/helper/dates';
import type { CaptainFlightFact } from '../../../src/modules/flights/infra/database/repository/flights.repository';

type ActualTimesheet = {
  offBlockTime?: string | null;
  takeoffTime?: string | null;
  arrivalTime?: string | null;
  onBlockTime?: string | null;
};

/**
 * Backfills the flight completion columns from each completed flight's actual
 * timesheet, then derives the per-user statistics projections from those facts
 * using the same computeProjections the live recompute uses. Runs last so all
 * flights are already loaded within the seed transaction.
 */
export async function loadStatistics(
  tx: Prisma.TransactionClient,
): Promise<void> {
  const flights = await tx.flight.findMany({
    where: { captainId: { not: null } },
    select: {
      id: true,
      captainId: true,
      greatCircleDistance: true,
      totalFuelBurned: true,
      operatorId: true,
      timesheet: true,
      aircraft: { select: { type: true } },
      airports: {
        select: {
          airport: {
            select: {
              id: true,
              icaoCode: true,
              country: true,
              continent: true,
            },
          },
        },
      },
    },
  });

  const factsByCaptain = new Map<string, CaptainFlightFact[]>();

  for (const flight of flights) {
    const actual = (flight.timesheet as { actual?: ActualTimesheet } | null)
      ?.actual;

    if (!actual?.onBlockTime) {
      continue;
    }

    const completedAt = new Date(actual.onBlockTime);
    const airborneMinutes = minutesBetween(
      actual.takeoffTime ? new Date(actual.takeoffTime) : null,
      actual.arrivalTime ? new Date(actual.arrivalTime) : null,
    );
    const blockMinutes = minutesBetween(
      actual.offBlockTime ? new Date(actual.offBlockTime) : null,
      completedAt,
    );

    await tx.flight.update({
      where: { id: flight.id },
      data: {
        completedAt,
        actualAirborneMinutes: airborneMinutes,
        actualBlockMinutes: blockMinutes,
      },
    });

    const captainId = flight.captainId as string;
    const facts = factsByCaptain.get(captainId) ?? [];
    facts.push({
      flightId: flight.id,
      completedAt,
      greatCircleDistance: flight.greatCircleDistance,
      fuelBurned: flight.totalFuelBurned,
      airborneMinutes,
      blockMinutes,
      aircraftType: flight.aircraft.type,
      operatorId: flight.operatorId,
      airports: flight.airports.map((entry) => ({
        airportId: entry.airport.id,
        icaoCode: entry.airport.icaoCode,
        country: entry.airport.country,
        continent: entry.airport.continent,
      })),
    });
    factsByCaptain.set(captainId, facts);
  }

  for (const [userId, facts] of factsByCaptain) {
    const projection = computeProjections(facts);

    await tx.userStatsTotal.create({ data: { userId, ...projection.total } });

    if (projection.byType.length) {
      await tx.userStatsByType.createMany({
        data: projection.byType.map((entry) => ({ userId, ...entry })),
      });
    }
    if (projection.byAirport.length) {
      await tx.userStatsByAirport.createMany({
        data: projection.byAirport.map((entry) => ({ userId, ...entry })),
      });
    }
    if (projection.daily.length) {
      await tx.userStatsDaily.createMany({
        data: projection.daily.map((entry) => ({ userId, ...entry })),
      });
    }
  }
}
