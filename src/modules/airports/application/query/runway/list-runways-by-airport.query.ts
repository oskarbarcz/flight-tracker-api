import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RunwaysRepository } from '../../../infra/database/runways.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { GetRunwayResponse } from '../../../infra/http/request/runway.dto';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { Runway } from '../../../model/runway.model';

export class ListRunwaysByAirportQuery extends Query<GetRunwayResponse[]> {
  constructor(public readonly airportId: string) {
    super();
  }
}

@QueryHandler(ListRunwaysByAirportQuery)
export class ListRunwaysByAirportHandler implements IQueryHandler<ListRunwaysByAirportQuery> {
  constructor(
    private readonly runwaysRepository: RunwaysRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(
    query: ListRunwaysByAirportQuery,
  ): Promise<GetRunwayResponse[]> {
    if (!(await this.airportsRepository.exists(query.airportId))) {
      throw new AirportNotFoundError();
    }

    const runways = await this.runwaysRepository.findAll(query.airportId);
    return runways as unknown as Runway[];
  }
}
