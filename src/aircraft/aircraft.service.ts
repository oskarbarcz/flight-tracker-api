import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAircraftDto } from './dto/create-aircraft.dto';
import { UpdateAircraftDto } from './dto/update-aircraft.dto';
import { PrismaService } from '../prisma/prisma.service';
import { v4 } from 'uuid';
import { Aircraft } from '@prisma/client';
import { AircraftInUseError } from './dto/errors.dto';

@Injectable()
export class AircraftService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAircraftDto): Promise<Aircraft> {
    const aircraft: Aircraft | null = await this.findOneBy({
      registration: data.registration,
    });

    if (aircraft) {
      throw new BadRequestException(
        'Aircraft with given registration already exists.',
      );
    }

    return this.prisma.aircraft.create({ data: { id: v4(), ...data } });
  }

  async findAll(): Promise<Aircraft[]> {
    return this.prisma.aircraft.findMany();
  }

  async findOne(id: string): Promise<Aircraft> {
    const aircraft: Aircraft | null = await this.findOneBy({ id });

    if (!aircraft) {
      throw new NotFoundException('Aircraft with given id does not exist.');
    }

    return aircraft;
  }

  async update(id: string, data: UpdateAircraftDto): Promise<Aircraft> {
    const aircraft: Aircraft | null = await this.findOneBy({ id });

    if (!aircraft) {
      throw new NotFoundException('Aircraft with given id does not exist.');
    }

    return this.prisma.aircraft.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: string): Promise<void> {
    const aircraft: Aircraft | null = await this.findOneBy({ id });

    if (!aircraft) {
      throw new NotFoundException('Aircraft with given id does not exist.');
    }

    const connectedFlights = await this.prisma.flight.count({
      where: { aircraftId: id },
    });

    if (connectedFlights > 0) {
      throw new BadRequestException(AircraftInUseError);
    }

    await this.prisma.aircraft.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.aircraft.count({
      where: { id },
    });

    return count === 1;
  }

  private async findOneBy(
    criteria: Partial<Record<keyof Aircraft, any>>,
  ): Promise<Aircraft | null> {
    return this.prisma.aircraft.findFirst({
      where: criteria,
    });
  }
}
