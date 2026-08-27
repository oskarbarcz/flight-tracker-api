import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { CityRef } from '../../../airports/model/city.model';

export type CityVisitSummary = {
  city: CityRef;
  country: string;
  visits: number;
  firstVisitAt: Date;
  lastVisitAt: Date;
};

@Injectable()
export class UserCityVisitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    id: string,
    userId: string,
    cityId: string,
    flightId: string,
    airportId: string,
    visitedAt: Date,
  ): Promise<void> {
    await this.prisma.userCityVisit.createMany({
      data: [{ id, userId, cityId, flightId, airportId, visitedAt }],
      skipDuplicates: true,
    });
  }

  async countVisitsToCity(userId: string, cityId: string): Promise<number> {
    return this.prisma.userCityVisit.count({ where: { userId, cityId } });
  }

  async summarizeByCity(userId: string): Promise<CityVisitSummary[]> {
    const visits = await this.prisma.userCityVisit.findMany({
      where: { userId },
      orderBy: { visitedAt: 'asc' },
      select: {
        visitedAt: true,
        city: { select: { id: true, name: true, country: true } },
      },
    });

    const summaries = new Map<string, CityVisitSummary>();

    for (const visit of visits) {
      const summary = summaries.get(visit.city.id);

      if (!summary) {
        summaries.set(visit.city.id, {
          city: { id: visit.city.id, name: visit.city.name },
          country: visit.city.country,
          visits: 1,
          firstVisitAt: visit.visitedAt,
          lastVisitAt: visit.visitedAt,
        });
        continue;
      }

      summary.visits += 1;
      summary.lastVisitAt = visit.visitedAt;
    }

    return [...summaries.values()];
  }
}
