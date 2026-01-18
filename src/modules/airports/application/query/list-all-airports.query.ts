import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../repository/airports.repository';
import { AirportListFilters, GetAirportResponse } from '../../dto/airport.dto';
import { Continent, Coordinates } from '../../entity/airport.entity';

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
