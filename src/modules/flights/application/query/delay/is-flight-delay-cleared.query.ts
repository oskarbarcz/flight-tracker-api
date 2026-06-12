import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { DelayRepository } from '../../../infra/database/repository/delay.repository';

export class IsFlightDelayClearedQuery extends Query<boolean> {
  constructor(public readonly flightId: string) {
    super();
  }
}

@QueryHandler(IsFlightDelayClearedQuery)
export class IsFlightDelayClearedHandler implements IQueryHandler<
  IsFlightDelayClearedQuery,
  boolean
> {
  constructor(private readonly delayRepository: DelayRepository) {}

  async execute(query: IsFlightDelayClearedQuery): Promise<boolean> {
    const request = await this.delayRepository.findByFlightId(query.flightId);
    return !request || request.isSettled;
  }
}
