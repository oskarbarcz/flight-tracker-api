import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';

export type ResolvedCity = {
  id: string;
  created: boolean;
};

export type CityRecord = {
  id: string;
  name: string;
  country: string;
};

@Injectable()
export class CitiesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findOrCreate(name: string, country: string): Promise<ResolvedCity> {
    const { count } = await this.prisma.city.createMany({
      data: [{ name, country }],
      skipDuplicates: true,
    });

    const city = await this.prisma.city.findUniqueOrThrow({
      where: { name_country: { name, country } },
      select: { id: true },
    });

    return { id: city.id, created: count === 1 };
  }

  async findById(id: string): Promise<CityRecord | null> {
    return this.prisma.city.findUnique({
      where: { id },
      select: { id: true, name: true, country: true },
    });
  }

  async findOneBy(criteria: {
    name: string;
    country: string;
  }): Promise<CityRecord | null> {
    return this.prisma.city.findUnique({
      where: { name_country: criteria },
      select: { id: true, name: true, country: true },
    });
  }

  async findAll(): Promise<CityRecord[]> {
    return this.prisma.city.findMany({
      select: { id: true, name: true, country: true },
      orderBy: { name: 'asc' },
    });
  }

  async countAirports(cityId: string): Promise<number> {
    return this.prisma.airport.count({ where: { cityId } });
  }

  async rename(id: string, name: string, country: string): Promise<void> {
    await this.prisma.city.update({ where: { id }, data: { name, country } });
  }
}
