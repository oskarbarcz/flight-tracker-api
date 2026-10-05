import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { RunwaysRepository } from '../../../infra/database/runways.repository';
import { GetRunwayResponse } from '../../../infra/http/request/runway.dto';
import { RunwayNotFoundError } from '../../../model/error/runway.error';
import { toRunwayResponse } from './get-runway-by-id.query';

export class FindRunwayQuery extends Query<GetRunwayResponse> {
  constructor(public readonly runwayId: string) {
    super();
  }
}

@QueryHandler(FindRunwayQuery)
export class FindRunwayHandler implements IQueryHandler<FindRunwayQuery> {
  constructor(private readonly runwaysRepository: RunwaysRepository) {}

  async execute(query: FindRunwayQuery): Promise<GetRunwayResponse> {
    const runway = await this.runwaysRepository.findOneBy({
      id: query.runwayId,
    });

    if (!runway) {
      throw new RunwayNotFoundError();
    }

    return toRunwayResponse(runway);
  }
}
