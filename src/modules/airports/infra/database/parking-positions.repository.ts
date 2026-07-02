import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { ParkingPosition, Prisma } from 'prisma/client/client';
import {
  CreateParkingPositionRequest,
  UpdateParkingPositionRequest,
} from '../http/request/parking-position.dto';

const selectParkingPosition = {
  id: true,
  airportId: true,
  terminalId: true,
  name: true,
  bridge: true,
  stairs: true,
  deicing: true,
  deicingDescription: true,
  gpu: true,
  pca: true,
  type: true,
  spotType: true,
  assistance: true,
  location: true,
  noiseSensitivity: true,
  noiseSensitivityText: true,
  noiseSensitivityStartTime: true,
  noiseSensitivityEndTime: true,
  fuelingOptions: true,
  coordinates: true,
} as const satisfies Prisma.ParkingPositionSelect;

type ParkingPositionView = Prisma.ParkingPositionGetPayload<{
  select: typeof selectParkingPosition;
}>;

@Injectable()
export class ParkingPositionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    airportId: string,
    parkingPositionId: string,
    data: CreateParkingPositionRequest,
  ): Promise<ParkingPositionView> {
    return this.prisma.parkingPosition.create({
      data: {
        id: parkingPositionId,
        airportId,
        ...data,
        coordinates:
          data.coordinates == null
            ? Prisma.DbNull
            : (data.coordinates as unknown as Prisma.InputJsonValue),
      },
      select: selectParkingPosition,
    });
  }

  async findAll(airportId: string): Promise<ParkingPositionView[]> {
    return this.prisma.parkingPosition.findMany({
      where: { airportId },
      select: selectParkingPosition,
      orderBy: { name: 'asc' },
    });
  }

  async findOneBy(
    criteria: Partial<Record<keyof ParkingPosition, any>>,
  ): Promise<ParkingPositionView | null> {
    return this.prisma.parkingPosition.findFirst({
      where: criteria,
      select: selectParkingPosition,
    });
  }

  async update(id: string, data: UpdateParkingPositionRequest): Promise<void> {
    await this.prisma.parkingPosition.update({
      where: { id },
      data: {
        ...data,
        coordinates:
          data.coordinates === undefined
            ? undefined
            : data.coordinates === null
              ? Prisma.DbNull
              : (data.coordinates as unknown as Prisma.InputJsonValue),
      },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.parkingPosition.delete({ where: { id } });
  }

  async exists(airportId: string, id: string): Promise<boolean> {
    return !!(await this.findOneBy({ id, airportId }));
  }
}
