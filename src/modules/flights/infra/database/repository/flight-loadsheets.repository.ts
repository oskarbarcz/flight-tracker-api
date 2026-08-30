import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  LoadsheetKind as PrismaLoadsheetKind,
  Prisma,
} from 'prisma/client/client';
import {
  FlightLoadsheet,
  Loadsheet,
  LoadsheetKind,
} from '../../../model/loadsheet.model';
import {
  CABIN_COLUMNS,
  CABINS,
  CabinName,
  toFlightLoadsheet,
} from '../../../model/loadsheet.mapper';
import { LoadsheetRevisionConflictError } from '../../../model/error/flight.error';

const FINAL_REVISION = 1;

function toFigures(
  loadsheet: Loadsheet,
): Omit<
  Prisma.FlightLoadsheetCreateManyInput,
  'flightId' | 'kind' | 'revision' | 'issuedById' | 'issuedAt'
> {
  return {
    pilots: loadsheet.flightCrew.pilots,
    reliefPilots: loadsheet.flightCrew.reliefPilots,
    cabinCrew: loadsheet.flightCrew.cabinCrew,
    passengers: loadsheet.passengers,
    ...toCabinCounts(loadsheet),
    passengerMass: loadsheet.passengerMass ?? null,
    cargo: loadsheet.cargo,
    payload: loadsheet.payload,
    zeroFuelWeight: loadsheet.zeroFuelWeight,
    blockFuel: loadsheet.blockFuel,
    fuelBlock: loadsheet.fuel?.block ?? null,
    fuelTaxi: loadsheet.fuel?.taxi ?? null,
    fuelTrip: loadsheet.fuel?.trip ?? null,
    fuelAlternate: loadsheet.fuel?.alternate ?? null,
    fuelReserve: loadsheet.fuel?.reserve ?? null,
    fuelContingencyType: loadsheet.fuel?.contingencyType ?? null,
    fuelContingencyAmount: loadsheet.fuel?.contingencyAmount ?? null,
    fuelMel: loadsheet.fuel?.mel ?? null,
    fuelAtc: loadsheet.fuel?.atc ?? null,
    fuelWxx: loadsheet.fuel?.wxx ?? null,
    fuelExtra: loadsheet.fuel?.extra ?? null,
    fuelTankering: loadsheet.fuel?.tankering ?? null,
    fuelEtops: loadsheet.fuel?.etops ?? null,
    fuelMinTakeoff: loadsheet.fuel?.minTakeoff ?? null,
    fuelPlanTakeoff: loadsheet.fuel?.planTakeoff ?? null,
    fuelPlanLanding: loadsheet.fuel?.planLanding ?? null,
    fuelAverageFlow: loadsheet.fuel?.averageFuelFlow ?? null,
    fuelMaxTanks: loadsheet.fuel?.maxTanks ?? null,
  };
}

function toCabinCounts(
  loadsheet: Loadsheet,
): Record<(typeof CABIN_COLUMNS)[CabinName], number | null> {
  const breakdown = loadsheet.passengersByCabin ?? {};

  return CABINS.reduce(
    (counts, cabin) => ({
      ...counts,
      [CABIN_COLUMNS[cabin]]: breakdown[cabin] ?? null,
    }),
    {} as Record<(typeof CABIN_COLUMNS)[CabinName], number | null>,
  );
}

function isRevisionTaken(error: unknown): boolean {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === 'P2002'
  );
}

@Injectable()
export class FlightLoadsheetsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listBy(
    flightId: string,
    kind?: LoadsheetKind,
  ): Promise<FlightLoadsheet[]> {
    const rows = await this.prisma.flightLoadsheet.findMany({
      where: { flightId, kind: kind as PrismaLoadsheetKind | undefined },
      orderBy: [{ kind: 'asc' }, { revision: 'asc' }],
    });

    return rows.map(toFlightLoadsheet);
  }

  async findCurrent(
    flightId: string,
    kind: LoadsheetKind,
  ): Promise<FlightLoadsheet | null> {
    const row = await this.prisma.flightLoadsheet.findFirst({
      where: { flightId, kind: kind as PrismaLoadsheetKind },
      orderBy: { revision: 'desc' },
    });

    return row === null ? null : toFlightLoadsheet(row);
  }

  async hasAny(flightId: string, kind: LoadsheetKind): Promise<boolean> {
    const count = await this.prisma.flightLoadsheet.count({
      where: { flightId, kind: kind as PrismaLoadsheetKind },
    });

    return count > 0;
  }

  async issuePreliminary(
    flightId: string,
    loadsheet: Loadsheet,
    issuedById: string,
  ): Promise<void> {
    const current = await this.prisma.flightLoadsheet.findFirst({
      where: { flightId, kind: PrismaLoadsheetKind.preliminary },
      orderBy: { revision: 'desc' },
      select: { revision: true },
    });

    await this.issue(
      flightId,
      PrismaLoadsheetKind.preliminary,
      (current?.revision ?? 0) + 1,
      loadsheet,
      issuedById,
    );
  }

  async issueFinal(
    flightId: string,
    loadsheet: Loadsheet,
    issuedById: string,
  ): Promise<void> {
    await this.issue(
      flightId,
      PrismaLoadsheetKind.final,
      FINAL_REVISION,
      loadsheet,
      issuedById,
    );
  }

  private async issue(
    flightId: string,
    kind: PrismaLoadsheetKind,
    revision: number,
    loadsheet: Loadsheet,
    issuedById: string,
  ): Promise<void> {
    try {
      await this.prisma.flightLoadsheet.create({
        data: {
          ...toFigures(loadsheet),
          flightId,
          kind,
          revision,
          issuedById,
          issuedAt: new Date(),
        },
      });
    } catch (error) {
      if (isRevisionTaken(error)) {
        throw new LoadsheetRevisionConflictError();
      }

      throw error;
    }
  }
}
