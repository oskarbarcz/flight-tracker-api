import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Prisma } from 'prisma/client/client';
import { RotationWhereInput } from 'prisma/client/models/Rotation';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  CreateRotationRequest,
  UpdateRotationRequest,
} from '../../http/request/rotation.request';
import { FlightStatus } from '../../../../flights/model/flight.entity';

const rotationSchema = {
  id: true,
  name: true,
  pilot: {
    select: {
      id: true,
      name: true,
      pilotLicenseId: true,
    },
  },
  flights: {
    select: {
      id: true,
      flightNumber: true,
    },
  },
  createdAt: true,
  updatedAt: true,
} as const satisfies Prisma.RotationSelect;

type RotationEntity = Prisma.RotationGetPayload<{
  select: typeof rotationSchema;
}>;

@Injectable()
export class RotationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    rotationId: string,
    operatorId: string,
    data: CreateRotationRequest,
  ): Promise<RotationEntity> {
    return this.prisma.rotation.create({
      data: {
        id: rotationId,
        name: data.name,
        pilotId: data.pilotId,
        operatorId: operatorId,
      },
      select: rotationSchema,
    });
  }

  async findOneBy(
    criteria: RotationWhereInput,
  ): Promise<RotationEntity | null> {
    return this.prisma.rotation.findFirst({
      where: criteria,
      select: rotationSchema,
    });
  }

  async findAllForOperator(operatorId: string): Promise<RotationEntity[]> {
    return this.prisma.rotation.findMany({
      where: { operatorId },
      select: rotationSchema,
    });
  }

  async update(id: string, data: UpdateRotationRequest): Promise<void> {
    await this.prisma.rotation.update({
      where: { id },
      data: { ...data, updatedAt: new Date() },
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.flight.updateMany({
      where: { rotationId: id },
      data: { rotationId: null },
    });

    await this.prisma.rotation.delete({ where: { id } });
  }

  async addFlight(rotationId: string, flightId: string): Promise<void> {
    const rotation = await this.prisma.rotation.findUnique({
      where: { id: rotationId },
    });
    if (!rotation) {
      throw new NotFoundException('Rotation with given ID does not exist');
    }

    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
    });
    if (!flight) {
      throw new NotFoundException('Flight with given ID does not exist');
    }

    if (flight.rotationId) {
      if (flight.rotationId === rotationId) {
        throw new ConflictException(
          'Flight is already assigned to this rotation',
        );
      }
      throw new ConflictException(
        'Flight is already assigned to a rotation. Remove it first.',
      );
    }

    if (flight.status !== FlightStatus.Created) {
      throw new BadRequestException(
        'Only flights in "created" status can be assigned to a rotation',
      );
    }

    await this.prisma.flight.update({
      where: { id: flightId },
      data: { rotationId },
    });
    await this.prisma.rotation.update({
      where: { id: rotationId },
      data: { updatedAt: new Date() },
    });
  }

  async removeFlight(rotationId: string, flightId: string): Promise<void> {
    const rotation = await this.prisma.rotation.findUnique({
      where: { id: rotationId },
    });
    if (!rotation) {
      throw new NotFoundException('Rotation with given ID does not exist');
    }

    const flight = await this.prisma.flight.findUnique({
      where: { id: flightId },
    });
    if (!flight) {
      throw new NotFoundException('Flight with given ID does not exist');
    }

    if (flight.rotationId !== rotationId) {
      throw new ConflictException('Flight is not assigned to this rotation');
    }

    if (flight.status !== FlightStatus.Created) {
      throw new BadRequestException(
        'Only flights in "created" status can be removed from a rotation',
      );
    }

    await this.prisma.flight.update({
      where: { id: flightId },
      data: { rotationId: null },
    });
    await this.prisma.rotation.update({
      where: { id: rotationId },
      data: { updatedAt: new Date() },
    });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.rotation.count({
      where: { id },
    });

    return count > 0;
  }
}
