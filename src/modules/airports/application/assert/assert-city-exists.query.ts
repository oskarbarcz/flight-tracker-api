import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { CitiesRepository } from '../../infra/database/cities.repository';
import { CityNotFoundError } from '../../model/error/city.error';

export class AssertCityExistsQuery {
  constructor(public readonly id: string) {}
}

@QueryHandler(AssertCityExistsQuery)
export class AssertCityExistsHandler implements IQueryHandler<AssertCityExistsQuery> {
  constructor(private readonly repository: CitiesRepository) {}

  async execute(query: AssertCityExistsQuery): Promise<void> {
    const city = await this.repository.findById(query.id);

    if (city) return;

    throw new CityNotFoundError();
  }
}
