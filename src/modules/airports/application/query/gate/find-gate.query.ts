import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GatesRepository } from '../../../infra/database/gates.repository';
import { GetGateResponse } from '../../../infra/http/request/gate.dto';
import { GateNotFoundError } from '../../../model/error/gate.error';
import { Gate } from '../../../model/gate.model';

export class FindGateQuery extends Query<GetGateResponse> {
  constructor(public readonly gateId: string) {
    super();
  }
}

@QueryHandler(FindGateQuery)
export class FindGateHandler implements IQueryHandler<FindGateQuery> {
  constructor(private readonly gatesRepository: GatesRepository) {}

  async execute(query: FindGateQuery): Promise<GetGateResponse> {
    const gate = await this.gatesRepository.findOneBy({ id: query.gateId });

    if (!gate) {
      throw new GateNotFoundError();
    }

    return gate as Gate;
  }
}
