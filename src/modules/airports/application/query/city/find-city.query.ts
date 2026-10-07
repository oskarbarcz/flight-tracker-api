import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { CitiesRepository } from '../../../infra/database/cities.repository';
import { CityRef } from '../../../model/city.model';
import { CityNotFoundError } from '../../../model/error/city.error';

export class FindCityQuery extends Query<CityRef> {
  constructor(public readonly cityId: string) {
    super();
  }
}

@QueryHandler(FindCityQuery)
export class FindCityHandler implements IQueryHandler<FindCityQuery> {
  constructor(private readonly repository: CitiesRepository) {}

  async execute(query: FindCityQuery): Promise<CityRef> {
    const city = await this.repository.findById(query.cityId);

    if (!city) {
      throw new CityNotFoundError();
    }

    return { id: city.id, name: city.name };
  }
}
