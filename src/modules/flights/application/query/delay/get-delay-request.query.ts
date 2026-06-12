import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { DelayRepository } from '../../../infra/database/repository/delay.repository';
import { GetDelayRequestResponse } from '../../../infra/http/request/delay.dto';
import { DelayRequestNotFoundError } from '../../../model/error/delay.error';

export class GetDelayRequestQuery extends Query<GetDelayRequestResponse> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(GetDelayRequestQuery)
export class GetDelayRequestHandler implements IQueryHandler<GetDelayRequestQuery> {
  constructor(private readonly delayRepository: DelayRepository) {}

  async execute(query: GetDelayRequestQuery): Promise<GetDelayRequestResponse> {
    const request = await this.delayRepository.findByFlightId(query.flightId);
    if (!request) {
      throw new DelayRequestNotFoundError();
    }
    return request;
  }
}
