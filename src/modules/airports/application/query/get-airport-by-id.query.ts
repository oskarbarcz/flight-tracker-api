import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAirportResponse } from '../../infra/http/request/airport.dto';
import { NotFoundException } from '@nestjs/common';
import { AirportsRepository } from '../../infra/database/repository/airports.repository';
import { Continent, Coordinates } from '../../model/airport.model';

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
      throw new NotFoundException('Airport with given id does not exist.');
    }

    return {
      ...airport,
      location: airport.location as unknown as Coordinates,
      continent: airport.continent as Continent,
    };
  }
}
