import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';

export type ResolvedCity = {
  id: string;
  created: boolean;
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
}
