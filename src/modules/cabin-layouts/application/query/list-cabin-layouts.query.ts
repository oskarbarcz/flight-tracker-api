import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { CabinLayoutsRepository } from '../../infra/database/repository/cabin-layouts.repository';
import { CabinLayoutList } from '../../infra/http/request/cabin-layout.request';

export class ListCabinLayoutsQuery extends Query<CabinLayoutList> {
  constructor(
    public readonly airlineIata: string | undefined,
    public readonly aircraftIata: string | undefined,
    public readonly retired: boolean | undefined,
    public readonly limit: number,
    public readonly offset: number,
  ) {
    super();
  }
}

@QueryHandler(ListCabinLayoutsQuery)
export class ListCabinLayoutsQueryHandler implements IQueryHandler<ListCabinLayoutsQuery> {
  constructor(
    private readonly cabinLayoutsRepository: CabinLayoutsRepository,
  ) {}

  async execute(query: ListCabinLayoutsQuery): Promise<CabinLayoutList> {
    const filters = {
      airlineIata: query.airlineIata?.toUpperCase(),
      aircraftIata: query.aircraftIata?.toUpperCase(),
      retired: query.retired,
      limit: query.limit,
      offset: query.offset,
    };

    const [items, total] = await Promise.all([
      this.cabinLayoutsRepository.findBy(filters),
      this.cabinLayoutsRepository.countBy(filters),
    ]);

    return { items, total, limit: query.limit, offset: query.offset };
  }
}
