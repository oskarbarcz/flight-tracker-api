import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { UserCountryVisitRepository } from '../../infra/database/user-country-visit.repository';
import { GetMyCountriesResponse } from '../../model/statistics.model';
import { findCountryOrThrow } from '../../../countries/model/country.model';

export class GetMyCountriesQuery extends Query<GetMyCountriesResponse> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetMyCountriesQuery)
export class GetMyCountriesHandler implements IQueryHandler<GetMyCountriesQuery> {
  constructor(private readonly repository: UserCountryVisitRepository) {}

  async execute(query: GetMyCountriesQuery): Promise<GetMyCountriesResponse> {
    const visited = await this.repository.summarizeByCountry(query.userId);

    return {
      countries: visited.map((entry) => {
        const country = findCountryOrThrow(entry.country);

        return {
          country: { code: country.code, name: country.name },
          flag: country.flag,
          visits: entry.visits,
          firstVisitAt: entry.firstVisitAt,
          lastVisitAt: entry.lastVisitAt,
        };
      }),
    };
  }
}
