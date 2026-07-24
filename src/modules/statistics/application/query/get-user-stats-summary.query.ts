import { Query, QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import {
  GetUserStatsSummaryResponse,
  MostFlownAirline,
  MostVisitedAirport,
} from '../../model/statistics.model';
import { StatisticsRepository } from '../../infra/database/statistics.repository';
import { GetOperatorByIdQuery } from '../../../operators/application/query/get-operator-by-id.query';
import { GetAirportByIdQuery } from '../../../airports/application/query/get-airport-by-id.query';

export class GetUserStatsSummaryQuery extends Query<GetUserStatsSummaryResponse> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserStatsSummaryQuery)
export class GetUserStatsSummaryHandler implements IQueryHandler<GetUserStatsSummaryQuery> {
  constructor(
    private readonly repository: StatisticsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    query: GetUserStatsSummaryQuery,
  ): Promise<GetUserStatsSummaryResponse> {
    const { userId } = query;

    const [total, byType, byAirport] = await Promise.all([
      this.repository.getTotal(userId),
      this.repository.listByType(userId),
      this.repository.listByAirport(userId),
    ]);

    const flights = total?.flights ?? 0;

    const countries = new Set(byAirport.map((entry) => entry.country));
    const continents = new Set(byAirport.map((entry) => entry.continent));

    return {
      totals: {
        distanceNm: total?.distanceNm ?? 0,
        airborneMinutes: total?.airborneMinutes ?? 0,
        blockMinutes: total?.blockMinutes ?? 0,
        flights,
        cycles: flights,
        fuelBurned: total?.fuelBurned ?? 0,
      },
      records: {
        longestFlightDistanceNm: total?.longestFlightDistanceNm ?? 0,
        longestFlightMinutes: total?.longestFlightMinutes ?? 0,
        firstFlightAt: total?.firstFlightAt ?? null,
        lastFlightAt: total?.lastFlightAt ?? null,
      },
      mostFlownAircraftType: byType[0]?.type ?? null,
      mostFlownAirline: await this.resolveAirline(total?.mostFlownOperatorId),
      geography: {
        airports: byAirport.length,
        countries: countries.size,
        continents: continents.size,
        mostVisitedAirport: await this.resolveMostVisited(byAirport[0]),
      },
    };
  }

  private async resolveAirline(
    operatorId: string | null | undefined,
  ): Promise<MostFlownAirline | null> {
    if (!operatorId) {
      return null;
    }

    const operator = await this.queryBus.execute(
      new GetOperatorByIdQuery(operatorId),
    );

    return {
      operatorId: operator.id,
      icaoCode: operator.icaoCode,
      shortName: operator.shortName,
      fullName: operator.fullName,
      logoUrl: operator.logoUrl ?? null,
    };
  }

  private async resolveMostVisited(
    top: { airportId: string; icaoCode: string; visits: number } | undefined,
  ): Promise<MostVisitedAirport | null> {
    if (!top) {
      return null;
    }

    const airport = await this.queryBus.execute(
      new GetAirportByIdQuery(top.airportId),
    );

    return {
      airportId: top.airportId,
      icaoCode: airport.icaoCode,
      name: airport.name,
      city: airport.city,
      country: airport.country,
      visits: top.visits,
    };
  }
}
