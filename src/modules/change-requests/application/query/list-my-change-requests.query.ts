import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { ChangeRequestsRepository } from '../../infra/database/change-requests.repository';
import { ChangeRequestTargets } from '../target/change-request-targets';
import {
  ChangeRequest,
  ChangeRequestStatus,
} from '../../model/change-request.model';

export class ListMyChangeRequestsQuery extends Query<ChangeRequest[]> {
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
  ChangeRequest[]
> {
  constructor(
    private readonly repository: ChangeRequestsRepository,
    private readonly targets: ChangeRequestTargets,
  ) {}

  async execute(query: ListMyChangeRequestsQuery): Promise<ChangeRequest[]> {
    const requests = await this.repository.listByRequester(query.userId, {
      status: query.status,
    });

    return this.targets.describeAll(requests);
  }
}
