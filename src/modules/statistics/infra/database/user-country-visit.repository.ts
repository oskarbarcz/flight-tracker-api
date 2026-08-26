import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/provider/prisma/prisma.service';
import { UserCountryVisit } from '../../../../../prisma/client/client';

export type CountryVisitSummary = {
  country: string;
  visits: number;
  firstVisitAt: Date;
  lastVisitAt: Date;
};

export type CountryVisitStamp = UserCountryVisit & {
  airport: { id: string; icaoCode: string; iataCode: string; name: string };
};

@Injectable()
export class UserCountryVisitRepository {
  constructor(private readonly prisma: PrismaService) {}

  async record(
    id: string,
    userId: string,
    country: string,
    flightId: string,
    airportId: string,
    visitedAt: Date,
  ): Promise<void> {
    await this.prisma.userCountryVisit.createMany({
      data: [{ id, userId, country, flightId, airportId, visitedAt }],
      skipDuplicates: true,
    });
  }

  async summarizeByCountry(userId: string): Promise<CountryVisitSummary[]> {
    const grouped = await this.prisma.userCountryVisit.groupBy({
      by: ['country'],
      where: { userId },
      _count: { _all: true },
      _min: { visitedAt: true },
      _max: { visitedAt: true },
    });

    return grouped
      .map((entry) => ({
        country: entry.country,
        visits: entry._count._all,
        firstVisitAt: entry._min.visitedAt as Date,
        lastVisitAt: entry._max.visitedAt as Date,
      }))
      .sort((a, b) => a.firstVisitAt.getTime() - b.firstVisitAt.getTime());
  }

  async listStamps(
    userId: string,
    country: string,
  ): Promise<CountryVisitStamp[]> {
    return this.prisma.userCountryVisit.findMany({
      where: { userId, country },
      orderBy: { visitedAt: 'desc' },
      include: {
        airport: {
          select: { id: true, icaoCode: true, iataCode: true, name: true },
        },
      },
    });
  }

  async listFirstVisits(
    userId: string,
  ): Promise<{ country: string; firstVisitAt: Date }[]> {
    const grouped = await this.prisma.userCountryVisit.groupBy({
      by: ['country'],
      where: { userId },
      _min: { visitedAt: true },
    });

    return grouped.map((entry) => ({
      country: entry.country,
      firstVisitAt: entry._min.visitedAt as Date,
    }));
  }
}
