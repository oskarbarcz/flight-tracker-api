import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../infra/database/airports.repository';
import { RunwaysRepository } from '../../infra/database/runways.repository';
import { AirportNotFoundError } from '../../model/error/airport.error';
import { RunwayNotFoundError } from '../../model/error/runway.error';

export class AssertRunwayExistsQuery {
  constructor(
    public readonly airportId: string,
    public readonly runwayId: string,
  ) {}
}

@QueryHandler(AssertRunwayExistsQuery)
export class AssertRunwayExistsHandler implements IQueryHandler<AssertRunwayExistsQuery> {
  constructor(
    private readonly airportsRepository: AirportsRepository,
    private readonly runwaysRepository: RunwaysRepository,
  ) {}

  async execute(query: AssertRunwayExistsQuery): Promise<void> {
    const { airportId, runwayId } = query;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (!(await this.runwaysRepository.exists(airportId, runwayId))) {
      throw new RunwayNotFoundError();
    }
  }
}
