import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { AircraftHoldLayout } from '../../model/hold-layout.model';
import { findHoldLayoutByType } from '../../data/cargo-holds';
import { HoldLayoutNotFoundError } from '../../model/error/cargo.error';

export class GetHoldLayoutQuery extends Query<AircraftHoldLayout> {
  constructor(public readonly type: string) {
    super();
  }
}

@QueryHandler(GetHoldLayoutQuery)
export class GetHoldLayoutHandler implements IQueryHandler<GetHoldLayoutQuery> {
  async execute(query: GetHoldLayoutQuery): Promise<AircraftHoldLayout> {
    const layout = findHoldLayoutByType(query.type);

    if (!layout) {
      throw new HoldLayoutNotFoundError(query.type);
    }

    return layout;
  }
}
