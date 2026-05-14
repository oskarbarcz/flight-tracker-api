import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { DiversionRepository } from '../../../infra/database/repository/diversion.repository';
import { GetDiversionResponse } from '../../../infra/http/request/diversion.dto';

export class GetDiversionQuery extends Query<GetDiversionResponse> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetDiversionQuery)
export class GetDiversionHandler implements IQueryHandler<GetDiversionQuery> {
  constructor(private readonly diversionRepository: DiversionRepository) {}

  async execute(query: GetDiversionQuery): Promise<GetDiversionResponse> {
    return this.diversionRepository.get(query.flightId);
  }
}
