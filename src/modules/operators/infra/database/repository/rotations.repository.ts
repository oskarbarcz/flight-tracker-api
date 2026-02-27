import { Injectable } from '@nestjs/common';
import { Prisma } from 'prisma/client/client';
import { RotationWhereInput } from 'prisma/client/models/Rotation';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import {
  CreateRotationRequest,
  UpdateRotationRequest,
} from '../../http/request/rotation.request';

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

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.rotation.count({
      where: { id },
    });

    return count > 0;
  }
}
