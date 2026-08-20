import {
  CommandBus,
  IQueryHandler,
  Query,
  QueryBus,
  QueryHandler,
} from '@nestjs/cqrs';
import { GetAircraftCabinLayoutQuery } from '../../../aircraft/application/query/get-aircraft-cabin-layout.query';
import { EnsureCabinLayoutVersionCommand } from '../../../cabin-layouts/application/command/ensure-cabin-layout-version.command';
import { GetCabinSeatMapQuery } from '../../../cabin-layouts/application/query/get-cabin-seat-map.query';
import { CabinSeatMap } from '../../../cabin-layouts/model/cabin-seat-map.model';

export class GetSeatCapacityQuery extends Query<number | null> {
  constructor(public readonly aircraftId: string) {
    super();
  }
}

@QueryHandler(GetSeatCapacityQuery)
export class GetSeatCapacityHandler implements IQueryHandler<GetSeatCapacityQuery> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  async execute(query: GetSeatCapacityQuery): Promise<number | null> {
    const layoutQuery = new GetAircraftCabinLayoutQuery(query.aircraftId);
    const cabinLayout: string | null = await this.queryBus.execute(layoutQuery);

    if (!cabinLayout) {
      return null;
    }

    const ensureVersion = new EnsureCabinLayoutVersionCommand(cabinLayout);
    await this.commandBus.execute(ensureVersion);

    const seatMapQuery = new GetCabinSeatMapQuery(cabinLayout);
    const seatMap: CabinSeatMap = await this.queryBus.execute(seatMapQuery);

    return seatMap.totalSeats;
  }
}
