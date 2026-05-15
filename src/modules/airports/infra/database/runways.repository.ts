import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { Prisma, Runway } from 'prisma/client/client';
import {
  CreateRunwayRequest,
  UpdateRunwayRequest,
} from '../http/request/runway.dto';

const selectRunway = {
  id: true,
  airportId: true,
  designator: true,
  length: true,
  width: true,
  displace: true,
  trueHeading: true,
  magneticHeading: true,
  elevation: true,
  surfaceType: true,
  lightingType: true,
  coordinates: true,
} as const satisfies Prisma.RunwaySelect;

type RunwayView = Prisma.RunwayGetPayload<{
  select: typeof selectRunway;
}>;

@Injectable()
export class RunwaysRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    airportId: string,
    runwayId: string,
    data: CreateRunwayRequest,
  ): Promise<RunwayView> {
    return this.prisma.runway.create({
      data: {
        id: runwayId,
        airportId,
        ...data,
        coordinates: data.coordinates as unknown as Prisma.JsonObject,
      },
      select: selectRunway,
    });
  }

  async findAll(airportId: string): Promise<RunwayView[]> {
    return this.prisma.runway.findMany({
      where: { airportId },
      select: selectRunway,
      orderBy: { designator: 'asc' },
    });
  }

  async findOneBy(
    criteria: Partial<Record<keyof Runway, any>>,
  ): Promise<RunwayView | null> {
    return this.prisma.runway.findFirst({
      where: criteria,
      select: selectRunway,
    });
  }

  async update(id: string, data: UpdateRunwayRequest): Promise<void> {
    await this.prisma.runway.update({
      where: { id },
      data: {
        ...data,
        coordinates: data.coordinates as unknown as
          | Prisma.JsonObject
          | undefined,
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.runway.delete({ where: { id } });
  }

  async exists(airportId: string, id: string): Promise<boolean> {
    return !!(await this.findOneBy({ id, airportId }));
  }
}
