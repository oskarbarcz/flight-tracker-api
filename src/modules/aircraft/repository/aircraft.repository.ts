import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../core/provider/prisma/prisma.service';
import { Aircraft, Prisma } from 'prisma/client/client';
import { CreateAircraftRequest } from '../dto/create-aircraft.dto';
import { UpdateAircraftRequest } from '../dto/update-aircraft.dto';

export type AircraftWithOperator = Prisma.AircraftGetPayload<{
  select: {
    id: true;
    icaoCode: true;
    shortName: true;
    fullName: true;
    registration: true;
    selcal: true;
    livery: true;
    operator: {
      select: {
        id: true;
        icaoCode: true;
        shortName: true;
        fullName: true;
        callsign: true;
      };
    };
    operatorId: false;
  };
}>;

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
      shortName: true,
      fullName: true,
      callsign: true,
    },
  },
  operatorId: false,
} as const satisfies Prisma.AircraftSelect;

@Injectable()
export class AircraftRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    id: string,
    data: CreateAircraftRequest,
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
    data: UpdateAircraftRequest,
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

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.aircraft.count({
      where: { id },
    });

    return count === 1;
  }

  async countFlights(aircraftId: string): Promise<number> {
    return this.prisma.flight.count({
      where: { aircraftId },
    });
  }
}
