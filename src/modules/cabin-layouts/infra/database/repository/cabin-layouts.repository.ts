import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { CabinLayout } from '../../../model/cabin-layout.model';
import { CollapsedLayout } from '../../../model/deck-collapse';

export interface CabinLayoutFilters {
  airlineIata?: string;
  aircraftIata?: string;
  retired?: boolean;
  limit: number;
  offset: number;
}

@Injectable()
export class CabinLayoutsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string): Promise<CabinLayout | null> {
    return this.prisma.cabinLayout.findUnique({ where: { id } });
  }

  async findAllIds(): Promise<string[]> {
    const rows = await this.prisma.cabinLayout.findMany({
      select: { id: true },
    });

    return rows.map(({ id }) => id);
  }

  async findRetiredIds(): Promise<string[]> {
    const rows = await this.prisma.cabinLayout.findMany({
      where: { retiredAt: { not: null } },
      select: { id: true },
    });

    return rows.map(({ id }) => id);
  }

  async findBy(filters: CabinLayoutFilters): Promise<CabinLayout[]> {
    const { airlineIata, aircraftIata, retired, limit, offset } = filters;

    return this.prisma.cabinLayout.findMany({
      where: {
        ...(airlineIata ? { airlineIata } : {}),
        ...(aircraftIata ? { aircraftIata } : {}),
        ...(retired === undefined
          ? {}
          : { retiredAt: retired ? { not: null } : null }),
      },
      orderBy: [{ airlineIata: 'asc' }, { aircraftIata: 'asc' }, { id: 'asc' }],
      take: limit,
      skip: offset,
    });
  }

  async countBy(filters: CabinLayoutFilters): Promise<number> {
    const { airlineIata, aircraftIata, retired } = filters;

    return this.prisma.cabinLayout.count({
      where: {
        ...(airlineIata ? { airlineIata } : {}),
        ...(aircraftIata ? { aircraftIata } : {}),
        ...(retired === undefined
          ? {}
          : { retiredAt: retired ? { not: null } : null }),
      },
    });
  }

  async upsertMany(layouts: CollapsedLayout[]): Promise<void> {
    for (const layout of layouts) {
      await this.prisma.cabinLayout.upsert({
        where: { id: layout.id },
        create: {
          id: layout.id,
          airlineIata: layout.airlineIata,
          aircraftIata: layout.aircraftIata,
          variant: layout.variant,
          sourceSlugs: layout.sourceSlugs,
        },
        update: {
          airlineIata: layout.airlineIata,
          aircraftIata: layout.aircraftIata,
          variant: layout.variant,
          sourceSlugs: layout.sourceSlugs,
          retiredAt: null,
        },
      });
    }
  }

  async retireAllExcept(ids: string[], retiredAt: Date): Promise<number> {
    const result = await this.prisma.cabinLayout.updateMany({
      where: { id: { notIn: ids }, retiredAt: null },
      data: { retiredAt },
    });

    return result.count;
  }
}
