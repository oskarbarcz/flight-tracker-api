import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAirportResponse } from '../../dto/airport.dto';
import { Continent, Coordinates } from '../../entity/airport.entity';
import { NotFoundException } from '@nestjs/common';
import { AirportsRepository } from '../../repository/airports.repository';

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
