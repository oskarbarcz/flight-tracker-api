import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../infra/database/airports.repository';

export class GetAirportCountryByIataCodeQuery extends Query<string | null> {
  constructor(public readonly iataCode: string) {
    super();
  }
}

@QueryHandler(GetAirportCountryByIataCodeQuery)
export class GetAirportCountryByIataCodeHandler implements IQueryHandler<GetAirportCountryByIataCodeQuery> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(
    query: GetAirportCountryByIataCodeQuery,
  ): Promise<string | null> {
    const airport = await this.repository.findOneBy({
      iataCode: query.iataCode,
    });

    return airport?.country ?? null;
  }
}
