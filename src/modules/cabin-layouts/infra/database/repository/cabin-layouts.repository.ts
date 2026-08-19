import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { CabinLayout } from '../../../model/cabin-layout.model';
import { CollapsedLayout } from '../../../model/deck-collapse';
import { AssembledVersion } from '../../../model/layout-version';
import { CabinSeatMap } from '../../../model/cabin-seat-map.model';

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

  async findNewestVersionHash(layoutId: string): Promise<string | null> {
    const version = await this.prisma.cabinLayoutVersion.findFirst({
      where: { layoutId },
      orderBy: { revision: 'desc' },
      select: { contentHash: true },
    });

    return version?.contentHash ?? null;
  }

  async findNewestRevision(layoutId: string): Promise<number | null> {
    const version = await this.prisma.cabinLayoutVersion.findFirst({
      where: { layoutId },
      orderBy: { revision: 'desc' },
      select: { revision: true },
    });

    return version?.revision ?? null;
  }

  async findNewestSeatMap(layoutId: string): Promise<CabinSeatMap | null> {
    const layout = await this.prisma.cabinLayout.findUnique({
      where: { id: layoutId },
      select: { airlineIata: true, aircraftIata: true },
    });

    const version = await this.prisma.cabinLayoutVersion.findFirst({
      where: { layoutId },
      orderBy: { revision: 'desc' },
      include: {
        decks: {
          orderBy: { deck: 'asc' },
          include: { seats: { orderBy: { designator: 'asc' } } },
        },
      },
    });

    if (!layout || !version) {
      return null;
    }

    return {
      layoutId,
      airlineIata: layout.airlineIata,
      aircraftIata: layout.aircraftIata,
      revision: version.revision,
      aircraftType: version.aircraftType,
      aircraftTypeDisplayed: version.aircraftTypeDisplayed,
      manufacturer: version.manufacturer,
      haulType: version.haulType,
      isDualDeck: version.isDualDeck,
      totalSeats: version.totalSeats,
      seatCounts: version.seatCounts as unknown as Record<string, number>,
      lastUpdated: version.lastUpdated.toISOString().slice(0, 10),
      fetchedAt: version.fetchedAt,
      decks: version.decks.map((deck) => ({
        deck: deck.deck,
        sourceSlug: deck.sourceSlug,
        canvas: { width: deck.canvasWidth, height: deck.canvasHeight },
        seatCount: deck.seatCount,
        lastUpdated: deck.lastUpdated.toISOString().slice(0, 10),
        assets:
          deck.assets as unknown as CabinSeatMap['decks'][number]['assets'],
        cabins:
          deck.cabins as unknown as CabinSeatMap['decks'][number]['cabins'],
        seats: deck.seats.map((seat) => ({
          designator: seat.designator,
          x: seat.x,
          y: seat.y,
          width: seat.width,
          height: seat.height,
          rotation: seat.rotation,
          reversed: seat.reversed,
          cabin: seat.cabin,
          rating: seat.rating,
          color: seat.color,
          bookable: seat.bookable,
          blocked: seat.blocked,
          crewRest: seat.crewRest,
          windowStatus: seat.windowStatus,
          seatProduct: seat.seatProduct,
          comments:
            seat.comments as unknown as CabinSeatMap['decks'][number]['seats'][number]['comments'],
        })),
      })),
    };
  }

  async createVersion(
    layoutId: string,
    revision: number,
    assembled: AssembledVersion,
    rawPayload: unknown,
  ): Promise<void> {
    await this.prisma.cabinLayoutVersion.create({
      data: {
        layoutId,
        revision,
        contentHash: assembled.contentHash,
        aircraftType: assembled.aircraftType,
        aircraftTypeDisplayed: assembled.aircraftTypeDisplayed,
        manufacturer: assembled.manufacturer,
        haulType: assembled.haulType,
        isDualDeck: assembled.isDualDeck,
        totalSeats: assembled.totalSeats,
        seatCounts: assembled.seatCounts as never,
        lastUpdated: new Date(assembled.lastUpdated),
        rawPayload: rawPayload as never,
        decks: {
          create: assembled.decks.map((deck) => ({
            deck: deck.deck,
            sourceSlug: deck.sourceSlug,
            canvasWidth: deck.canvasWidth,
            canvasHeight: deck.canvasHeight,
            seatCount: deck.seatCount,
            lastUpdated: new Date(deck.lastUpdated),
            assets: deck.assets as never,
            cabins: deck.cabins as never,
            seats: {
              create: deck.seats.map((seat) => ({
                designator: seat.designator,
                x: seat.x,
                y: seat.y,
                width: seat.width,
                height: seat.height,
                rotation: seat.rotation,
                reversed: seat.reversed,
                cabin: seat.cabin,
                rating: seat.rating,
                color: seat.color,
                bookable: seat.bookable,
                blocked: seat.blocked,
                crewRest: seat.crewRest,
                windowStatus: seat.windowStatus,
                seatProduct: seat.seatProduct,
                comments: seat.comments as never,
              })),
            },
          })),
        },
      },
    });
  }
}
