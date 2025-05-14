import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { v4 } from 'uuid';
import { CreateRotationDto } from './dto/create-rotation.dto';
import { UpdateRotationDto } from './dto/update-rotation.dto';

export const rotationWithFlightsAndUserFields = Prisma.validator<Prisma.RotationSelect>()({
  id: true,
  name: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
  },
  flights: {
    select: {
      id: true,
      flightNumber: true,
      callsign: true,
      status: true,
      timesheet: true,
      loadsheets: true,
      operator: {
        select: {
          id: true,
          icaoCode: true,
          shortName: true,
          fullName: true,
          callsign: true,
        },
      },
      aircraft: {
        select: {
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
        },
      },
      airports: {
        select: {
          airportType: true,
          airport: {
            select: {
              id: true,
              icaoCode: true,
              iataCode: true,
              city: true,
              name: true,
              country: true,
              timezone: true,
            },
          },
        },
      },
    },
  },
});

export type RotationWithFlightsAndUser = Prisma.RotationGetPayload<{
  select: typeof rotationWithFlightsAndUserFields;
}>;

@Injectable()
export class RotationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    input: CreateRotationDto,
  ): Promise<RotationWithFlightsAndUser> {
    const rotationId = v4();
    const now = new Date();

    const rotation = await this.prisma.rotation.create({
      data: {
        id: rotationId,
        name: input.name,
        userId: userId,
        createdAt: now,
        updatedAt: now,
      },
      select: rotationWithFlightsAndUserFields,
    });

    return rotation;
  }

  async findOneBy(
    criteria: Partial<Record<keyof Prisma.RotationWhereInput, any>>,
  ): Promise<RotationWithFlightsAndUser | null> {
    return this.prisma.rotation.findFirst({
      where: criteria,
      select: rotationWithFlightsAndUserFields,
    });
  }

  async findAll(): Promise<RotationWithFlightsAndUser[]> {
    return this.prisma.rotation.findMany({
      select: rotationWithFlightsAndUserFields,
    });
  }

  async findAllByUserId(userId: string): Promise<RotationWithFlightsAndUser[]> {
    return this.prisma.rotation.findMany({
      where: { userId },
      select: rotationWithFlightsAndUserFields,
    });
  }

  async update(
    id: string,
    data: UpdateRotationDto,
  ): Promise<RotationWithFlightsAndUser> {
    return this.prisma.rotation.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
      select: rotationWithFlightsAndUserFields,
    });
  }

  async remove(id: string): Promise<void> {
    await this.prisma.rotation.delete({ where: { id } });
  }

  async addFlight(rotationId: string, flightId: string): Promise<void> {
    await this.prisma.flight.update({
      where: { id: flightId },
      data: { rotationId },
    });
  }

  async removeFlight(flightId: string): Promise<void> {
    await this.prisma.flight.update({
      where: { id: flightId },
      data: { rotationId: null },
    });
  }

  async setCurrentRotation(userId: string, rotationId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentRotationId: rotationId },
    });
  }

  async clearCurrentRotation(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentRotationId: null },
    });
  }
}