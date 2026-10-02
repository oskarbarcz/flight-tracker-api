import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ChangeRequestsRepository } from '../../infra/database/change-requests.repository';
import {
  AnyChangeRequest,
  ChangeRequestStatus,
} from '../../model/change-request.model';

export class ListMyChangeRequestsQuery extends Query<AnyChangeRequest[]> {
  constructor(
    public readonly userId: string,
    public readonly status?: ChangeRequestStatus,
  ) {
    super();
  }
}

@QueryHandler(ListMyChangeRequestsQuery)
export class ListMyChangeRequestsHandler implements IQueryHandler<
  ListMyChangeRequestsQuery,
  AnyChangeRequest[]
> {
  constructor(private readonly repository: ChangeRequestsRepository) {}

  async execute(query: ListMyChangeRequestsQuery): Promise<AnyChangeRequest[]> {
    return this.repository.listByRequester(query.userId, {
      status: query.status,
    });
  }
}
