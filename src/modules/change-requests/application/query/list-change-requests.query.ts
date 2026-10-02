import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import {
  ChangeRequestFilters,
  ChangeRequestsRepository,
} from '../../infra/database/change-requests.repository';
import { AnyChangeRequest } from '../../model/change-request.model';

export class ListChangeRequestsQuery extends Query<AnyChangeRequest[]> {
  constructor(public readonly filters: ChangeRequestFilters) {
    super();
  }
}

@QueryHandler(ListChangeRequestsQuery)
export class ListChangeRequestsHandler implements IQueryHandler<
  ListChangeRequestsQuery,
  AnyChangeRequest[]
> {
  constructor(private readonly repository: ChangeRequestsRepository) {}

  async execute(query: ListChangeRequestsQuery): Promise<AnyChangeRequest[]> {
    return this.repository.list(query.filters);
  }
}
