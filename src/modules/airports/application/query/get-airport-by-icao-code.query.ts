import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../infra/database/repository/airports.repository';
import { GetAirportResponse } from '../../infra/http/request/airport.dto';
import { NotFoundException } from '@nestjs/common';
import { Continent, Coordinates } from '../../model/airport.model';

export class GetAirportByIcaoCodeQuery extends Query<GetAirportResponse> {
  constructor(public readonly icaoCode: string) {
    super();
  }
}

@QueryHandler(GetAirportByIcaoCodeQuery)
export class GetAirportByIcaoCodeHandler implements IQueryHandler<GetAirportByIcaoCodeQuery> {
  constructor(private readonly repository: AirportsRepository) {}

  async execute(query: GetAirportByIcaoCodeQuery): Promise<GetAirportResponse> {
    const airport = await this.repository.findOneBy({
      icaoCode: query.icaoCode,
    });

    if (!airport) {
      throw new NotFoundException(
        'Airport with given ICAO code does not exist.',
      );
    }

    return {
      ...airport,
      location: airport.location as unknown as Coordinates,
      continent: airport.continent as Continent,
    };
  }
}
