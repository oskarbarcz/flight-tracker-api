import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { Rotation } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateRotationRequest,
  UpdateRotationRequest,
} from './dto/create-rotation.dto';
import { v4 } from 'uuid';
import { RotationId } from './entities/rotation.entity';
import { FlightStatus } from '../flights/entities/flight.entity';

@Injectable()
export class RotationsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(request: CreateRotationRequest): Promise<Rotation> {
    if (!(await this.pilotExists(request.pilotId))) {
      throw new NotFoundException('Pilot with given ID does not exist');
    }

    return this.prisma.rotation.create({
      data: {
        id: v4(),
        name: request.name,
        pilotId: request.pilotId,
      },
    });
  }

  async findAll(): Promise<Rotation[]> {
    return this.prisma.rotation.findMany();
  }

  async findOneById(id: RotationId): Promise<Rotation | null> {
    return this.prisma.rotation.findFirst({
      where: { id },
    });
  }

  async update(
    id: RotationId,
    request: UpdateRotationRequest,
  ): Promise<Rotation> {
    if (!(await this.rotationExists(id))) {
      throw new NotFoundException('Rotation with given ID does not exist');
    }

    if (request.pilotId && !(await this.pilotExists(request.pilotId))) {
      throw new NotFoundException('Pilot with given ID does not exist');
    }

    return this.prisma.rotation.update({
      where: { id },
      data: {
        ...request,
        updatedAt: new Date(),
      },
    });
  }

  async remove(id: RotationId): Promise<void> {
    if (!(await this.rotationExists(id))) {
      throw new NotFoundException('Rotation with given ID does not exist');
    }

    await this.prisma.flight.updateMany({
      where: { rotationId: id },
      data: { rotationId: null },
    });

    await this.prisma.rotation.delete({ where: { id } });
  }

  private async pilotExists(pilotId: string): Promise<boolean> {
    const count = await this.prisma.user.count({
      where: { id: pilotId },
    });

    return count > 0;
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

  private async rotationExists(id: RotationId): Promise<boolean> {
    console.log(id);
    const count = await this.prisma.rotation.count({
      where: { id: id },
    });

    return count > 0;
  }
}
