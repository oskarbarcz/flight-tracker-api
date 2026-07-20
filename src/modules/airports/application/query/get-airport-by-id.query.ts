import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAirportResponse } from '../../infra/http/request/airport.dto';
import { AirportsRepository } from '../../infra/database/airports.repository';
import { Continent, Coordinates } from '../../model/airport.model';
import { AirportNotFoundError } from '../../model/error/airport.error';

export class GetAirportByIdQuery extends Query<GetAirportResponse> {
  constructor(public readonly airportId: string) {
    super();
  }
}

@QueryHandler(GetAirportByIdQuery)
export class GetAirportByIdHandler implements IQueryHandler<GetAirportByIdQuery> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(query: GetAirportByIdQuery): Promise<GetAirportResponse> {
    const airport = await this.repository.findOneBy({ id: query.airportId });

    if (!airport) {
      throw new AirportNotFoundError();
    }

    return {
      ...airport,
      location: airport.location as unknown as Coordinates,
      continent: airport.continent as Continent,
      shape: airport.shape as unknown as Coordinates[] | null,
    };
  }
}
