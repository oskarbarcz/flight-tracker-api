import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import {
  ChangeRequestFilters,
  ChangeRequestsRepository,
} from '../../infra/database/change-requests.repository';
import { ChangeRequestTargets } from '../target/change-request-targets';
import { ChangeRequest } from '../../model/change-request.model';

export class ListChangeRequestsQuery extends Query<ChangeRequest[]> {
  constructor(public readonly filters: ChangeRequestFilters) {
    super();
  }
}

@QueryHandler(ListChangeRequestsQuery)
export class ListChangeRequestsHandler implements IQueryHandler<
  ListChangeRequestsQuery,
  ChangeRequest[]
> {
  constructor(
    private readonly repository: ChangeRequestsRepository,
    private readonly targets: ChangeRequestTargets,
  ) {}

  async execute(query: ListChangeRequestsQuery): Promise<ChangeRequest[]> {
    const requests = await this.repository.list(query.filters);

    return this.targets.describeAll(requests);
  }
}
