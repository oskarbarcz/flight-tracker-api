import { IQueryHandler, Query, QueryBus, QueryHandler } from '@nestjs/cqrs';
import { GetAircraftCabinLayoutQuery } from '../../../aircraft/application/query/get-aircraft-cabin-layout.query';
import { GetCabinCapacityQuery } from '../../../cabin-layouts/application/query/get-cabin-capacity.query';
import { CabinCapacity } from '../../../cabin-layouts/model/cabin-capacity.model';

export class GetSeatCapacityQuery extends Query<CabinCapacity | null> {
  constructor(public readonly aircraftId: string) {
    super();
  }
}

@QueryHandler(GetSeatCapacityQuery)
export class GetSeatCapacityHandler implements IQueryHandler<GetSeatCapacityQuery> {
  constructor(private readonly queryBus: QueryBus) {}

  async execute(query: GetSeatCapacityQuery): Promise<CabinCapacity | null> {
    const layoutQuery = new GetAircraftCabinLayoutQuery(query.aircraftId);
    const cabinLayout: string | null = await this.queryBus.execute(layoutQuery);

    if (!cabinLayout) {
      return null;
    }

    const capacityQuery = new GetCabinCapacityQuery(cabinLayout);

    return this.queryBus.execute(capacityQuery);
  }
}
