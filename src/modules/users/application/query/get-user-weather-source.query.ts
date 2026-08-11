import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { UsersRepository } from '../../infra/database/repository/users.repository';
import { WeatherSource } from '../../../airports/model/airport-weather.model';

export class GetUserWeatherSourceQuery extends Query<WeatherSource> {
  constructor(public readonly userId: string) {
    super();
  }
}

@QueryHandler(GetUserWeatherSourceQuery)
export class GetUserWeatherSourceHandler implements IQueryHandler<GetUserWeatherSourceQuery> {
  constructor(private readonly repository: UsersRepository) {}

  async execute(query: GetUserWeatherSourceQuery): Promise<WeatherSource> {
    return this.repository.getDefaultWeatherSource(query.userId);
  }
}
