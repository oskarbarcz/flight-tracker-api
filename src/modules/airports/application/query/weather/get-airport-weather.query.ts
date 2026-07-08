import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAirportWeatherResponse } from '../../../model/airport-weather.model';
import { AirportWeatherRepository } from '../../../infra/database/airport-weather.repository';
import { AirportWeatherNotFoundError } from '../../../model/error/airport-weather.error';

export class GetAirportWeatherQuery extends Query<GetAirportWeatherResponse> {
  constructor(public readonly airportId: string) {
    super();
  }
}

@QueryHandler(GetAirportWeatherQuery)
export class GetAirportWeatherHandler implements IQueryHandler<GetAirportWeatherQuery> {
  constructor(private readonly repository: AirportWeatherRepository) {}

  async execute(
    query: GetAirportWeatherQuery,
  ): Promise<GetAirportWeatherResponse> {
    const weather = await this.repository.getByAirportId(query.airportId);

    if (!weather) {
      throw new AirportWeatherNotFoundError();
    }

    return weather;
  }
}
