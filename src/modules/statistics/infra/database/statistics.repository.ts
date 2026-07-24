import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import {
  UserStatsByAirport,
  UserStatsByType,
  UserStatsDaily,
  UserStatsTotal,
} from '../../../../../prisma/client/client';
import { UserStatsProjection } from '../../model/compute-projections';

@Injectable()
export class StatisticsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async replaceForUser(
    userId: string,
    projection: UserStatsProjection,
  ): Promise<void> {
    const now = new Date();

    await this.prisma.$transaction([
      this.prisma.userStatsTotal.upsert({
        where: { userId },
        create: { userId, ...projection.total, updatedAt: now },
        update: { ...projection.total, updatedAt: now },
      }),
      this.prisma.userStatsByType.deleteMany({ where: { userId } }),
      this.prisma.userStatsByType.createMany({
        data: projection.byType.map((entry) => ({ userId, ...entry })),
      }),
      this.prisma.userStatsByAirport.deleteMany({ where: { userId } }),
      this.prisma.userStatsByAirport.createMany({
        data: projection.byAirport.map((entry) => ({ userId, ...entry })),
      }),
      this.prisma.userStatsDaily.deleteMany({ where: { userId } }),
      this.prisma.userStatsDaily.createMany({
        data: projection.daily.map((entry) => ({ userId, ...entry })),
      }),
    ]);
  }

  async getTotal(userId: string): Promise<UserStatsTotal | null> {
    return this.prisma.userStatsTotal.findUnique({ where: { userId } });
  }

  async listByType(userId: string): Promise<UserStatsByType[]> {
    return this.prisma.userStatsByType.findMany({
      where: { userId },
      orderBy: [{ flights: 'desc' }, { type: 'asc' }],
    });
  }

  async listByAirport(userId: string): Promise<UserStatsByAirport[]> {
    return this.prisma.userStatsByAirport.findMany({
      where: { userId },
      orderBy: [{ visits: 'desc' }, { icaoCode: 'asc' }],
    });
  }

  async listDailyBetween(
    userId: string,
    from: Date,
    to: Date,
  ): Promise<UserStatsDaily[]> {
    return this.prisma.userStatsDaily.findMany({
      where: { userId, day: { gte: from, lt: to } },
      orderBy: { day: 'asc' },
    });
  }
}
