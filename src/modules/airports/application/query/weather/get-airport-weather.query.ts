import { Query, QueryHandler, IQueryHandler, QueryBus } from '@nestjs/cqrs';
import {
  GetAirportWeatherResponse,
  WeatherInformationType,
  WeatherSource,
} from '../../../model/airport-weather.model';
import { AirportWeatherRepository } from '../../../infra/database/airport-weather.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { WeatherSourceFilter } from '../../../infra/http/request/weather.dto';
import { GetUserWeatherSourceQuery } from '../../../../users/application/query/get-user-weather-source.query';

export class GetAirportWeatherQuery extends Query<GetAirportWeatherResponse[]> {
  constructor(
    public readonly airportId: string,
    public readonly source: WeatherSourceFilter,
    public readonly userId?: string,
  ) {
    super();
  }
}

@QueryHandler(GetAirportWeatherQuery)
export class GetAirportWeatherHandler implements IQueryHandler<GetAirportWeatherQuery> {
  constructor(
    private readonly weatherRepository: AirportWeatherRepository,
    private readonly airportsRepository: AirportsRepository,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(
    query: GetAirportWeatherQuery,
  ): Promise<GetAirportWeatherResponse[]> {
    if (!(await this.airportsRepository.exists(query.airportId))) {
      throw new AirportNotFoundError();
    }

    const source = await this.resolveSource(query);
    const reports = await this.weatherRepository.findByAirportId(
      query.airportId,
      source,
    );

    return reports.map((report) => ({
      ...report,
      source: report.source as WeatherSource,
      informationType: report.informationType as WeatherInformationType,
    }));
  }

  private async resolveSource(
    query: GetAirportWeatherQuery,
  ): Promise<WeatherSource | undefined> {
    if (query.source === WeatherSourceFilter.All) {
      return undefined;
    }

    if (query.source !== WeatherSourceFilter.UserDefault) {
      return query.source as unknown as WeatherSource;
    }

    if (!query.userId) {
      return WeatherSource.AviationWeatherGov;
    }

    const sourceQuery = new GetUserWeatherSourceQuery(query.userId);

    return this.queryBus.execute(sourceQuery);
  }
}
