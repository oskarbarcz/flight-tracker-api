import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { Rotation, RotationStatus } from '../../../model/rotation.model';

const airportPreview = {
  select: { id: true, iataCode: true, icaoCode: true, name: true },
} as const;

const userPreview = {
  select: { id: true, name: true },
} as const;

const rotationInclude = {
  createdBy: userPreview,
  updatedBy: userPreview,
  legs: {
    orderBy: { offBlockTime: 'asc' },
    include: {
      departure: airportPreview,
      arrival: airportPreview,
      flight: {
        select: { id: true, flightNumber: true, status: true },
      },
    },
  },
} as const;

export type LegRow = {
  id: string;
  rotationId: string;
  flightNumber: string;
  departureId: string;
  arrivalId: string;
  offBlockTime: Date;
  onBlockTime: Date;
  flightId: string | null;
};

export type NewLeg = {
  flightNumber: string;
  departureId: string;
  arrivalId: string;
  offBlockTime: Date;
  onBlockTime: Date;
};

@Injectable()
export class RotationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    id: string,
    name: string,
    operatorId: string,
    pilotId: string,
    createdById: string,
  ): Promise<void> {
    await this.prisma.rotation.create({
      data: {
        id,
        name,
        operatorId,
        pilotId,
        createdById,
        status: RotationStatus.Draft,
      },
    });
  }

  async update(
    id: string,
    name: string,
    pilotId: string,
    actorId: string,
  ): Promise<void> {
    await this.prisma.rotation.update({
      where: { id },
      data: { name, pilotId, updatedById: actorId, updatedAt: new Date() },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.rotation.delete({ where: { id } });
  }

  async findById(id: string): Promise<Rotation | null> {
    const rotation = await this.prisma.rotation.findUnique({
      where: { id },
      include: rotationInclude,
    });

    if (!rotation) return null;

    return this.toModel(rotation);
  }

  async findAll(criteria: {
    operatorId?: string;
    pilotId?: string;
  }): Promise<Rotation[]> {
    const rotations = await this.prisma.rotation.findMany({
      where: criteria,
      orderBy: { createdAt: 'asc' },
      include: rotationInclude,
    });

    return rotations.map((rotation) => this.toModel(rotation));
  }

  async findLegByFlightId(flightId: string): Promise<LegRow | null> {
    return this.prisma.rotationLeg.findUnique({ where: { flightId } });
  }

  async updateStatus(
    id: string,
    status: RotationStatus,
    actorId: string | null,
  ): Promise<void> {
    await this.prisma.rotation.update({
      where: { id },
      data: { status, updatedById: actorId, updatedAt: new Date() },
    });
  }

  async addLeg(
    rotationId: string,
    leg: NewLeg,
    actorId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.rotationLeg.create({ data: { rotationId, ...leg } }),
      this.touch(rotationId, actorId),
    ]);
  }

  async updateLeg(
    rotationId: string,
    legId: string,
    data: Partial<NewLeg>,
    actorId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.rotationLeg.update({ where: { id: legId }, data }),
      this.touch(rotationId, actorId),
    ]);
  }

  async removeLeg(
    rotationId: string,
    legId: string,
    actorId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.rotationLeg.delete({ where: { id: legId } }),
      this.touch(rotationId, actorId),
    ]);
  }

  async setLegFlight(
    rotationId: string,
    legId: string,
    flightId: string | null,
    actorId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.rotationLeg.update({
        where: { id: legId },
        data: { flightId },
      }),
      this.touch(rotationId, actorId),
    ]);
  }

  private touch(rotationId: string, actorId: string | null) {
    return this.prisma.rotation.update({
      where: { id: rotationId },
      data: { updatedById: actorId, updatedAt: new Date() },
    });
  }

  private toModel(rotation: {
    id: string;
    name: string;
    operatorId: string;
    pilotId: string;
    status: string;
    createdAt: Date;
    updatedAt: Date | null;
    createdBy: { id: string; name: string };
    updatedBy: { id: string; name: string } | null;
    legs: Array<{
      id: string;
      flightNumber: string;
      offBlockTime: Date;
      onBlockTime: Date;
      departure: {
        id: string;
        iataCode: string;
        icaoCode: string;
        name: string;
      };
      arrival: { id: string; iataCode: string; icaoCode: string; name: string };
      flight: { id: string; flightNumber: string; status: string } | null;
    }>;
  }): Rotation {
    return {
      id: rotation.id,
      name: rotation.name,
      operatorId: rotation.operatorId,
      pilotId: rotation.pilotId,
      status: rotation.status as RotationStatus,
      createdBy: rotation.createdBy,
      updatedBy: rotation.updatedBy,
      createdAt: rotation.createdAt,
      updatedAt: rotation.updatedAt,
      legs: rotation.legs.map((leg) => ({
        id: leg.id,
        flightNumber: leg.flightNumber,
        departure: leg.departure,
        arrival: leg.arrival,
        offBlockTime: leg.offBlockTime,
        onBlockTime: leg.onBlockTime,
        blockTime: Math.round(
          (leg.onBlockTime.getTime() - leg.offBlockTime.getTime()) / 60000,
        ),
        flight: leg.flight,
      })),
    };
  }
}
