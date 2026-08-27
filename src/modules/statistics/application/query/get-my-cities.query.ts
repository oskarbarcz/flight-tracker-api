import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { UserCityVisitRepository } from '../../infra/database/user-city-visit.repository';
import { GetMyCitiesResponse } from '../../model/statistics.model';
import { toCountryRef } from '../../../countries/model/country.model';

export class GetMyCitiesQuery extends Query<GetMyCitiesResponse> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetMyCitiesQuery)
export class GetMyCitiesHandler implements IQueryHandler<GetMyCitiesQuery> {
  constructor(private readonly repository: UserCityVisitRepository) {}

  async execute(query: GetMyCitiesQuery): Promise<GetMyCitiesResponse> {
    const visited = await this.repository.summarizeByCity(query.userId);

    return {
      cities: visited.map((entry) => ({
        city: entry.city,
        country: toCountryRef(entry.country),
        visits: entry.visits,
        firstVisitAt: entry.firstVisitAt,
        lastVisitAt: entry.lastVisitAt,
      })),
    };
  }
}
