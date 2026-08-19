import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/client/client';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { CabinDeckName } from '../../../../cabin-layouts/model/layout-version';
import { PassengerStatus } from '../../../model/manifest.model';

export type NewPassenger = {
  designator: string;
  deck: CabinDeckName;
  cabin: string;
  name: string;
  pnr: string;
};

const passenger = {
  designator: true,
  deck: true,
  cabin: true,
  name: true,
  pnr: true,
  status: true,
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
        })),
      }),
    ]);
  }

  async findByFlight(flightId: string): Promise<PassengerRow[]> {
    return this.prisma.flightPassenger.findMany({
      where: { flightId },
      orderBy: [{ deck: 'asc' }, { designator: 'asc' }],
      select: passenger,
    });
  }
}
