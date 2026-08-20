import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/client/client';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { CabinDeckName } from '../../../../cabin-layouts/model/layout-version';
import {
  PassengerSpecialService,
  PassengerStatus,
} from '../../../model/manifest.model';

export type NewPassenger = {
  designator: string;
  deck: CabinDeckName;
  cabin: string;
  name: string;
  pnr: string;
  ssr: PassengerSpecialService | null;
};

const passenger = {
  designator: true,
  deck: true,
  cabin: true,
  name: true,
  pnr: true,
  status: true,
  ssr: true,
} as const satisfies Prisma.FlightPassengerSelect;

export type PassengerRow = Prisma.FlightPassengerGetPayload<{
  select: typeof passenger;
}>;

@Injectable()
export class PassengersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async replace(flightId: string, passengers: NewPassenger[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.flightPassenger.deleteMany({ where: { flightId } }),
      this.prisma.flightPassenger.createMany({
        data: passengers.map((entry) => ({
          flightId,
          designator: entry.designator,
          deck: entry.deck,
          cabin: entry.cabin,
          name: entry.name,
          pnr: entry.pnr,
          status: PassengerStatus.Boarded,
          ssr: entry.ssr,
        })),
      }),
    ]);
  }

  async findByFlight(
    flightId: string,
    status?: PassengerStatus,
  ): Promise<PassengerRow[]> {
    return this.prisma.flightPassenger.findMany({
      where: { flightId, ...(status ? { status } : {}) },
      orderBy: [{ deck: 'asc' }, { designator: 'asc' }],
      select: passenger,
    });
  }

  async add(flightId: string, passengers: NewPassenger[]): Promise<void> {
    await this.prisma.flightPassenger.createMany({
      data: passengers.map((entry) => ({
        flightId,
        designator: entry.designator,
        deck: entry.deck,
        cabin: entry.cabin,
        name: entry.name,
        pnr: entry.pnr,
        status: PassengerStatus.Boarded,
        ssr: entry.ssr,
      })),
    });
  }

  async markAsNoShow(flightId: string, designators: string[]): Promise<void> {
    await this.prisma.flightPassenger.updateMany({
      where: { flightId, designator: { in: designators } },
      data: { status: PassengerStatus.NoShow },
    });
  }
}
