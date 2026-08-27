import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { CitiesRepository } from '../../../infra/database/cities.repository';
import { ListCitiesResponse } from '../../../model/city.model';
import { toCountryRef } from '../../../../countries/model/country.model';
import { GetCityIdsWithPostcardQuery } from '../../../../game/application/query/postcard/get-city-ids-with-postcard.query';

export class ListCitiesQuery extends Query<ListCitiesResponse> {
  constructor(public readonly hasPostcard?: boolean) {
    super();
  }
}

@QueryHandler(ListCitiesQuery)
export class ListCitiesHandler implements IQueryHandler<ListCitiesQuery> {
  constructor(
    private readonly repository: CitiesRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: ListCitiesQuery): Promise<ListCitiesResponse> {
    const withPostcard = new GetCityIdsWithPostcardQuery();

    const [cities, cityIdsWithPostcard] = await Promise.all([
      this.repository.findAll(),
      this.queryBus.execute(withPostcard),
    ]);

    const held = new Set(cityIdsWithPostcard);

    const listed = cities
      .map((city) => ({
        id: city.id,
        name: city.name,
        country: toCountryRef(city.country),
        hasPostcard: held.has(city.id),
      }))
      .filter(
        (city) =>
          query.hasPostcard === undefined ||
          city.hasPostcard === query.hasPostcard,
      );

    return { cities: listed };
  }
}
