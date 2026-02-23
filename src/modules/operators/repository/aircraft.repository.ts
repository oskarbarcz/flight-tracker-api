import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/provider/prisma/prisma.service';
import { Aircraft as AircraftEntity, Prisma } from 'prisma/client/client';
import {
  CreateAircraftRequest,
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

const aircraft = {
  id: true,
  icaoCode: true,
  shortName: true,
  fullName: true,
  registration: true,
  selcal: true,
  livery: true,
  operatorId: false,
} as const satisfies Prisma.AircraftSelect;

type AircraftWithOperator = Prisma.AircraftGetPayload<{
  select: typeof aircraftWithOperatorFields;
}>;

type Aircraft = Prisma.AircraftGetPayload<{
  select: typeof aircraft;
}>;

@Injectable()
export class AircraftRepository {
  constructor(private readonly prisma: PrismaService) {}

  async legacyCreate(
    id: string,
    data: LegacyCreateAircraftRequest,
  ): Promise<void> {
    await this.prisma.aircraft.create({
      data: { id, ...data },
    });
  }

  async create(
    id: string,
    operatorId: string,
    data: CreateAircraftRequest,
  ): Promise<void> {
    await this.prisma.aircraft.create({
      data: { id, ...data, operatorId },
    });
  }

  async findAll(): Promise<AircraftWithOperator[]> {
    return this.prisma.aircraft.findMany({
      select: aircraftWithOperatorFields,
    });
  }

  async findAllForOperator(operatorId: string): Promise<Aircraft[]> {
    return this.prisma.aircraft.findMany({
      where: { operatorId },
      select: aircraft,
    });
  }

  async legacyFindOneBy(
    criteria: Partial<Record<keyof AircraftEntity, any>>,
  ): Promise<AircraftWithOperator | null> {
    return this.prisma.aircraft.findFirst({
      where: criteria,
      select: aircraftWithOperatorFields,
    });
  }

  async findOneBy(
    criteria: Partial<Record<keyof AircraftEntity, any>>,
  ): Promise<Aircraft | null> {
    return this.prisma.aircraft.findFirst({
      where: criteria,
      select: aircraft,
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
