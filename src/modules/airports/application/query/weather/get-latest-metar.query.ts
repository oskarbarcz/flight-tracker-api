import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { AirportWeatherRepository } from '../../../infra/database/airport-weather.repository';

export class GetLatestMetarQuery extends Query<string | null> {
  constructor(public readonly iataCode: string) {
    super();
  }
}

@QueryHandler(GetLatestMetarQuery)
export class GetLatestMetarHandler implements IQueryHandler<GetLatestMetarQuery> {
  constructor(private readonly weatherRepository: AirportWeatherRepository) {}

  async execute(query: GetLatestMetarQuery): Promise<string | null> {
    return this.weatherRepository.findLatestMetarByIataCode(query.iataCode);
  }
}
