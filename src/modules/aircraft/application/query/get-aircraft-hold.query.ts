import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';
import { AircraftNotFoundError } from '../../model/error/aircraft.error';

export type AircraftHold = {
  type: string;
  holdVariant: string | null;
};

export class GetAircraftHoldQuery extends Query<AircraftHold> {
  constructor(public readonly aircraftId: string) {
    super();
  }
}

@QueryHandler(GetAircraftHoldQuery)
export class GetAircraftHoldHandler implements IQueryHandler<GetAircraftHoldQuery> {
  constructor(private readonly aircraftRepository: AircraftRepository) {}

  async execute(query: GetAircraftHoldQuery): Promise<AircraftHold> {
    const aircraft = await this.aircraftRepository.findOneBy({
      id: query.aircraftId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    return { type: aircraft.type, holdVariant: aircraft.holdVariant };
  }
}
