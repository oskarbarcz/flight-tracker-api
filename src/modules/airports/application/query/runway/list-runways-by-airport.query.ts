import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RunwaysRepository } from '../../../infra/database/runways.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { GetRunwayResponse } from '../../../infra/http/request/runway.dto';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { LightingType, SurfaceType } from '../../../model/runway.model';
import { Coordinates } from '../../../model/airport.model';

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
    return runways.map((runway) => ({
      ...runway,
      surfaceType: runway.surfaceType as SurfaceType,
      lightingType: runway.lightingType as LightingType,
      coordinates: runway.coordinates as unknown as Coordinates,
    }));
  }
}
