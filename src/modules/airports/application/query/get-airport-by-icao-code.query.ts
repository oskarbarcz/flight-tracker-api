import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../infra/database/airports.repository';
import { GetAirportResponse } from '../../infra/http/request/airport.dto';
import { Continent, Coordinates } from '../../model/airport.model';
import { AirportByIcaoCodeNotFoundError } from '../../model/error/airport.error';

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
      throw new AirportByIcaoCodeNotFoundError();
    }

    return {
      ...airport,
      location: airport.location as unknown as Coordinates,
      continent: airport.continent as Continent,
      shape: airport.shape as unknown as Coordinates[] | null,
    };
  }
}
