import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { COUNTRIES, GetCountriesResponse } from '../../model/country.model';

export class ListCountriesQuery extends Query<GetCountriesResponse> {}

@QueryHandler(ListCountriesQuery)
export class ListCountriesHandler implements IQueryHandler<ListCountriesQuery> {
  async execute(): Promise<GetCountriesResponse> {
    return { countries: [...COUNTRIES] };
  }
}
