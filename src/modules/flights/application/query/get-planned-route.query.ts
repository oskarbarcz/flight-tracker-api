import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { FlightsRepository } from '../../infra/database/repository/flights.repository';
import { FlightDoesNotExistError } from '../../model/error/flight.error';
import { PlannedRoute } from '../../model/planned-route.model';

export class GetPlannedRouteQuery extends Query<PlannedRoute> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetPlannedRouteQuery)
export class GetPlannedRouteHandler implements IQueryHandler<GetPlannedRouteQuery> {
  constructor(private readonly repository: FlightsRepository) {}

  async execute(query: GetPlannedRouteQuery): Promise<PlannedRoute> {
    const route = await this.repository.findPlannedRoute(query.flightId);

    if (!route) {
      throw new FlightDoesNotExistError();
    }

    return route;
  }
}
