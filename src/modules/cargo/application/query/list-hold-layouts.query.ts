import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { AircraftHoldLayout } from '../../model/hold-layout.model';
import { AIRCRAFT_HOLD_LAYOUTS } from '../../data/cargo-holds';

export class ListHoldLayoutsQuery extends Query<AircraftHoldLayout[]> {}

@QueryHandler(ListHoldLayoutsQuery)
export class ListHoldLayoutsHandler implements IQueryHandler<ListHoldLayoutsQuery> {
  async execute(): Promise<AircraftHoldLayout[]> {
    return [...AIRCRAFT_HOLD_LAYOUTS];
  }
}
