import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { GetAircraftResponse } from '../../../infra/http/request/aircraft.request';
import { AircraftRepository } from '../../../infra/database/repository/aircraft.repository';
import { AircraftNotFoundError } from '../../../model/error/aircraft.error';
import { OperatorsRepository } from '../../../infra/database/repository/operators.repository';
import { OperatorNotFoundError } from '../../../model/error/operator.error';

export class GetAircraftByIdQuery extends Query<GetAircraftResponse> {
  constructor(
    public readonly operatorId: string,
    public readonly aircraftId: string,
  ) {
    super();
  }
}

@QueryHandler(GetAircraftByIdQuery)
export class GetAircraftByIdHandler implements IQueryHandler<GetAircraftByIdQuery> {
  constructor(
    private readonly aircraftRepository: AircraftRepository,
    private readonly operatorsRepository: OperatorsRepository,
  ) {}

  async execute(query: GetAircraftByIdQuery): Promise<GetAircraftResponse> {
    const operatorExists = await this.operatorsRepository.exists(
      query.operatorId,
    );

    if (!operatorExists) {
      throw new OperatorNotFoundError();
    }

    const aircraft = await this.aircraftRepository.findOneBy({
      id: query.aircraftId,
      operatorId: query.operatorId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    return aircraft;
  }
}
