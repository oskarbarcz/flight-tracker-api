import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RunwaysRepository } from '../../../infra/database/runways.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { GetRunwayResponse } from '../../../infra/http/request/runway.dto';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { RunwayNotFoundError } from '../../../model/error/runway.error';
import { Runway } from '../../../model/runway.model';

export class GetRunwayByIdQuery extends Query<GetRunwayResponse> {
  constructor(
    public readonly airportId: string,
    public readonly runwayId: string,
  ) {
    super();
  }
}

@QueryHandler(GetRunwayByIdQuery)
export class GetRunwayByIdHandler implements IQueryHandler<GetRunwayByIdQuery> {
  constructor(
    private readonly runwaysRepository: RunwaysRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(query: GetRunwayByIdQuery): Promise<GetRunwayResponse> {
    const { airportId, runwayId } = query;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    const runway = await this.runwaysRepository.findOneBy({
      id: runwayId,
      airportId,
    });

    if (!runway) {
      throw new RunwayNotFoundError();
    }

    return runway as Runway;
  }
}
