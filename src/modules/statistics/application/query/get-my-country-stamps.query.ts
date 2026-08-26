import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { UserCountryVisitRepository } from '../../infra/database/user-country-visit.repository';
import { GetCountryStampsResponse } from '../../model/statistics.model';
import { findCountryOrThrow } from '../../../countries/model/country.model';
import { CountryNotVisitedError } from '../../model/error/statistics.error';

export class GetMyCountryStampsQuery extends Query<GetCountryStampsResponse> {
  constructor(
    public readonly userId: string,
    public readonly code: string,
  ) {
    super();
  }
}

@QueryHandler(GetMyCountryStampsQuery)
export class GetMyCountryStampsHandler implements IQueryHandler<GetMyCountryStampsQuery> {
  constructor(private readonly repository: UserCountryVisitRepository) {}

  async execute(
    query: GetMyCountryStampsQuery,
  ): Promise<GetCountryStampsResponse> {
    const country = findCountryOrThrow(query.code);

    const stamps = await this.repository.listStamps(query.userId, country.code);

    if (stamps.length === 0) {
      throw new CountryNotVisitedError(country.code);
    }

    return {
      country: { code: country.code, name: country.name },
      flag: country.flag,
      stamps: stamps.map((stamp) => ({
        icaoCode: stamp.airport.icaoCode,
        iataCode: stamp.airport.iataCode,
        airportName: stamp.airport.name,
        airportId: stamp.airport.id,
        flightId: stamp.flightId,
        visitedAt: stamp.visitedAt,
      })),
    };
  }
}
