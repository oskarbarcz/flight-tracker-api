import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { AirportNotamsRepository } from '../../../infra/database/airport-notams.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { GetAirportNotamResponse } from '../../../model/airport-notam.model';
import { AirportNotFoundError } from '../../../model/error/airport.error';

export class ListAirportNotamsQuery extends Query<GetAirportNotamResponse[]> {
  constructor(public readonly airportId: string) {
    super();
  }
}

@QueryHandler(ListAirportNotamsQuery)
export class ListAirportNotamsHandler implements IQueryHandler<ListAirportNotamsQuery> {
  constructor(
    private readonly notamsRepository: AirportNotamsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(
    query: ListAirportNotamsQuery,
  ): Promise<GetAirportNotamResponse[]> {
    if (!(await this.airportsRepository.exists(query.airportId))) {
      throw new AirportNotFoundError();
    }

    return this.notamsRepository.findActiveByAirportId(query.airportId);
  }
}
