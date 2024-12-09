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

    await this.prisma.aircraft.delete({ where: { id } });
  }

  private async findOneBy(
    criteria: Partial<Record<keyof Aircraft, any>>,
  ): Promise<Aircraft | null> {
    return this.prisma.aircraft.findFirst({
      where: criteria,
    });
  }
}
