import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { DelayRepository } from '../../../infra/database/repository/delay.repository';
import { GetDelayRequestResponse } from '../../../infra/http/request/delay.dto';
import { DelayRequestStatus } from '../../../model/delay-request.model';

export class ListDelayRequestsQuery extends Query<GetDelayRequestResponse[]> {
  constructor(public readonly status?: DelayRequestStatus) {
    super();
  }
}

@QueryHandler(ListDelayRequestsQuery)
export class ListDelayRequestsHandler implements IQueryHandler<
  ListDelayRequestsQuery,
  GetDelayRequestResponse[]
> {
  constructor(private readonly delayRepository: DelayRepository) {}

  async execute(
    query: ListDelayRequestsQuery,
  ): Promise<GetDelayRequestResponse[]> {
    return this.delayRepository.list(query.status);
  }
}
