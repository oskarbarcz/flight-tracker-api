import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { WaypointsRepository } from '../../infra/database/waypoints.repository';
import { WaypointResponse } from '../../model/waypoint.model';
import { WaypointNotFoundError } from '../../model/error/waypoint.error';

export class GetWaypointQuery {
  constructor(public readonly ident: string) {}
}

@QueryHandler(GetWaypointQuery)
export class GetWaypointHandler implements IQueryHandler<GetWaypointQuery> {
  constructor(private readonly repository: WaypointsRepository) {}

  async execute(query: GetWaypointQuery): Promise<WaypointResponse[]> {
    const waypoints = await this.repository.findByIdent(query.ident);

    if (waypoints.length === 0) {
      throw new WaypointNotFoundError();
    }

    return waypoints;
  }
}
