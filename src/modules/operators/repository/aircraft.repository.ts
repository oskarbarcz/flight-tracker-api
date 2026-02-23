import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/provider/prisma/prisma.service';
import { Aircraft, Prisma } from 'prisma/client/client';
import {
  LegacyCreateAircraftRequest,
  LegacyUpdateAircraftRequest,
} from '../controller/request/aircraft.request';

const aircraftWithOperatorFields = {
  id: true,
  icaoCode: true,
  shortName: true,
  fullName: true,
  registration: true,
  selcal: true,
  livery: true,
  operator: {
    select: {
      id: true,
      icaoCode: true,
      iataCode: true,
      shortName: true,
      fullName: true,
      callsign: true,
    },
  },
  operatorId: false,
} as const satisfies Prisma.AircraftSelect;

export type AircraftWithOperator = Prisma.AircraftGetPayload<{
  select: typeof aircraftWithOperatorFields;
}>;

@Injectable()
export class AircraftRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    id: string,
    data: LegacyCreateAircraftRequest,
  ): Promise<AircraftWithOperator> {
    return this.prisma.aircraft.create({
      data: { id, ...data },
      select: aircraftWithOperatorFields,
    });
  }

  async findAll(): Promise<AircraftWithOperator[]> {
    return this.prisma.aircraft.findMany({
      select: aircraftWithOperatorFields,
    });
  }

  async findOneBy(
    criteria: Partial<Record<keyof Aircraft, any>>,
  ): Promise<AircraftWithOperator | null> {
    return this.prisma.aircraft.findFirst({
      where: criteria,
      select: aircraftWithOperatorFields,
    });
  }

  async update(
    id: string,
    data: LegacyUpdateAircraftRequest,
  ): Promise<AircraftWithOperator> {
    return this.prisma.aircraft.update({
      where: { id },
      data: data,
      select: aircraftWithOperatorFields,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.aircraft.delete({ where: { id } });
  }

  async exists(
    criteria: Partial<Record<keyof Aircraft, any>>,
  ): Promise<boolean> {
    const count = await this.prisma.aircraft.count({
      where: criteria,
    });

    return count > 0;
  }

  async countFlights(aircraftId: string): Promise<number> {
    return this.prisma.flight.count({
      where: { aircraftId },
    });
  }
}
