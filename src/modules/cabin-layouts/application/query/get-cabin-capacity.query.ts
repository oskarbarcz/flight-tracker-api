import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { CabinLayoutsRepository } from '../../infra/database/repository/cabin-layouts.repository';
import { CabinCapacity } from '../../model/cabin-capacity.model';

export class GetCabinCapacityQuery extends Query<CabinCapacity | null> {
  constructor(public readonly layoutId: string) {
    super();
  }
}

@QueryHandler(GetCabinCapacityQuery)
export class GetCabinCapacityQueryHandler implements IQueryHandler<GetCabinCapacityQuery> {
  constructor(
    private readonly cabinLayoutsRepository: CabinLayoutsRepository,
  ) {}

  async execute(query: GetCabinCapacityQuery): Promise<CabinCapacity | null> {
    return this.cabinLayoutsRepository.findCapacity(query.layoutId);
  }
}
