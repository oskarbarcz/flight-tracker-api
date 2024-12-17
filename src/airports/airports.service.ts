import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateAirportDto } from './dto/create-airport.dto';
import { UpdateAirportDto } from './dto/update-airport.dto';
import { v4 } from 'uuid';
import { PrismaService } from '../prisma/prisma.service';
import { Airport } from '@prisma/client';

@Injectable()
export class AirportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateAirportDto): Promise<Airport> {
    const airport: Airport | null = await this.findOneBy({
      icaoCode: data.icaoCode,
    });

    if (airport) {
      throw new BadRequestException(
        'Aircraft with given ICAO code already exists.',
      );
    }

    return this.prisma.airport.create({ data: { id: v4(), ...data } });
  }

  async findAll(): Promise<Airport[]> {
    return this.prisma.airport.findMany();
  }

  async findOne(id: string): Promise<Airport> {
    const airport: Airport | null = await this.findOneBy({ id });

    if (!airport) {
      throw new NotFoundException('Airport with given id does not exist.');
    }

    return airport;
  }

  async update(id: string, data: UpdateAirportDto) {
    const airport: Airport | null = await this.findOneBy({ id });

    if (!airport) {
      throw new NotFoundException('Airport with given id does not exist.');
    }

    return this.prisma.airport.update({
      where: { id },
      data: data,
    });
  }

  async remove(id: string): Promise<void> {
    const airport: Airport | null = await this.findOneBy({ id });

    if (!airport) {
      throw new NotFoundException('Airport with given id does not exist.');
    }

    await this.prisma.airport.delete({ where: { id } });
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.prisma.airport.count({
      where: { id },
    });

    return count === 1;
  }

  private async findOneBy(
    criteria: Partial<Record<keyof Airport, any>>,
  ): Promise<Airport | null> {
    return this.prisma.airport.findFirst({
      where: criteria,
    });
  }
}
