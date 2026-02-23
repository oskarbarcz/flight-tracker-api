import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { OperatorNotFoundError } from '../../../model/error/operator.error';
import { OperatorsRepository } from '../../../repository/operators.repository';
import { GetAircraftResponse } from '../../../controller/request/aircraft.request';
import { AircraftRepository } from '../../../repository/aircraft.repository';

export class ListAllAircraftQuery extends Query<GetAircraftResponse[]> {
  constructor(public readonly operatorId: string) {
    super();
  }
}

@QueryHandler(ListAllAircraftQuery)
export class ListAllAircraftHandler implements IQueryHandler<ListAllAircraftQuery> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly operatorsRepository: OperatorsRepository,
  ) {}

  async execute(query: ListAllAircraftQuery): Promise<GetAircraftResponse[]> {
    const operatorExists = await this.operatorsRepository.exists(
      query.operatorId,
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    return this.aircraftRepository.findAllForOperator(query.operatorId);
  }
}
