import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../../core/provider/prisma/prisma.service';
import { NotocStage, Prisma } from 'prisma/client/client';

export type NotocRow = Prisma.FlightNotocGetPayload<object>;

@Injectable()
export class NotocRepository {
  constructor(private readonly prisma: PrismaService) {}

  async issue(
    flightId: string,
    stage: NotocStage,
    issuedAt: Date,
    document: Prisma.InputJsonValue,
  ): Promise<void> {
    await this.prisma.flightNotoc.upsert({
      where: { flightId_stage: { flightId, stage } },
      create: { flightId, stage, issuedAt, document },
      update: {
        issuedAt,
        document,
        acknowledgedById: null,
        acknowledgedAt: null,
      },
    });
  }

  async acknowledge(
    flightId: string,
    stage: NotocStage,
    actorId: string,
    acknowledgedAt: Date,
  ): Promise<void> {
    await this.prisma.flightNotoc.updateMany({
      where: { flightId, stage, acknowledgedAt: null },
      data: { acknowledgedById: actorId, acknowledgedAt },
    });
  }

  async findByStage(
    flightId: string,
    stage: NotocStage,
  ): Promise<NotocRow | null> {
    return this.prisma.flightNotoc.findUnique({
      where: { flightId_stage: { flightId, stage } },
    });
  }

  async findLatest(flightId: string): Promise<NotocRow | null> {
    return this.prisma.flightNotoc.findFirst({
      where: { flightId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async flightIdsWithNotoc(flightIds: string[]): Promise<string[]> {
    const rows = await this.prisma.flightNotoc.findMany({
      where: { flightId: { in: flightIds } },
      select: { flightId: true },
      distinct: ['flightId'],
    });

    return rows.map((row) => row.flightId);
  }
}
