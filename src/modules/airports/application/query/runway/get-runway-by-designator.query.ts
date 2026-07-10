import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RunwaysRepository } from '../../../infra/database/runways.repository';
import { RunwayId } from '../../../model/runway.model';

export class GetRunwayByDesignatorQuery extends Query<RunwayId | null> {
  constructor(
    public readonly airportId: string,
    public readonly designator: string,
  ) {
    super();
  }
}

@QueryHandler(GetRunwayByDesignatorQuery)
export class GetRunwayByDesignatorHandler implements IQueryHandler<GetRunwayByDesignatorQuery> {
  constructor(private readonly runwaysRepository: RunwaysRepository) {}

  async execute(query: GetRunwayByDesignatorQuery): Promise<RunwayId | null> {
    const { airportId, designator } = query;

    const runway = await this.runwaysRepository.findOneBy({
      airportId,
      designator,
    });

    return runway?.id ?? null;
  }
}
