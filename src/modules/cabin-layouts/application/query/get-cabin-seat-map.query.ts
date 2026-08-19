import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { CabinLayoutsRepository } from '../../infra/database/repository/cabin-layouts.repository';
import { CabinSeatMap } from '../../model/cabin-seat-map.model';
import { CabinLayoutNotFoundError } from '../../model/error/cabin-layout.error';

export class GetCabinSeatMapQuery extends Query<CabinSeatMap> {
  constructor(public readonly layoutId: string) {
    super();
  }
}

@QueryHandler(GetCabinSeatMapQuery)
export class GetCabinSeatMapQueryHandler implements IQueryHandler<GetCabinSeatMapQuery> {
  constructor(
    private readonly cabinLayoutsRepository: CabinLayoutsRepository,
  ) {}

  async execute(query: GetCabinSeatMapQuery): Promise<CabinSeatMap> {
    const seatMap = await this.cabinLayoutsRepository.findNewestSeatMap(
      query.layoutId,
    );

    if (!seatMap) {
      throw new CabinLayoutNotFoundError(query.layoutId);
    }

    return seatMap;
  }
}
