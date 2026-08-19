import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { CabinLayoutsRepository } from '../../infra/database/repository/cabin-layouts.repository';
import { CabinLayout } from '../../model/cabin-layout.model';
import { CabinLayoutNotFoundError } from '../../model/error/cabin-layout.error';

export class GetCabinLayoutQuery extends Query<CabinLayout> {
  constructor(public readonly id: string) {
    super();
  }
}

@QueryHandler(GetCabinLayoutQuery)
export class GetCabinLayoutQueryHandler implements IQueryHandler<GetCabinLayoutQuery> {
  constructor(
    private readonly cabinLayoutsRepository: CabinLayoutsRepository,
  ) {}

  async execute(query: GetCabinLayoutQuery): Promise<CabinLayout> {
    const layout = await this.cabinLayoutsRepository.findById(query.id);

    if (!layout) {
      throw new CabinLayoutNotFoundError(query.id);
    }

    return layout;
  }
}
