import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../infra/database/repository/airports.repository';
import { Continent, Coordinates } from '../../model/airport.model';
import {
  AirportListFilters,
  GetAirportResponse,
} from '../../infra/http/request/airport.dto';

export class ListAllAirportsQuery extends Query<GetAirportResponse[]> {
  constructor(public readonly filters: AirportListFilters) {
    super();
  }
}

@QueryHandler(ListAllAirportsQuery)
export class ListAllAirportsHandler implements IQueryHandler<ListAllAirportsQuery> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(query: ListAllAirportsQuery): Promise<GetAirportResponse[]> {
    const airports = await this.repository.findAll(query.filters);

    return airports.map((airport) => ({
      ...airport,
      location: airport.location as unknown as Coordinates,
      continent: airport.continent as Continent,
    }));
  }
}
