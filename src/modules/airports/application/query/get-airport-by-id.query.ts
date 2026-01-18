import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../repository/airports.repository';
import { GetAirportResponse } from '../../dto/airport.dto';
import { Continent, Coordinates } from '../../entity/airport.entity';

export class GetAirportByIdQuery extends Query<GetAirportResponse> {
  constructor(public readonly airportId: string) {
    super();
  }
}

@QueryHandler(GetAirportByIdQuery)
export class GetAirportByIdHandler implements IQueryHandler<GetAirportByIdQuery> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(query: GetAirportByIdQuery): Promise<GetAirportResponse> {
    const airport = await this.repository.findOne(query.airportId);

    return {
      ...airport,
      location: airport.location as unknown as Coordinates,
      continent: airport.continent as Continent,
    };
  }
}
