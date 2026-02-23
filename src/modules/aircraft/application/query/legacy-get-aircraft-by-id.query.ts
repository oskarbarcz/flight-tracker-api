import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../operators/infra/database/repository/aircraft.repository';
import { LegacyCreateAircraftResponse } from '../../../operators/infra/http/request/aircraft.request';
import { AircraftNotFoundError } from '../../../operators/model/error/aircraft.error';

export class LegacyGetAircraftByIdQuery extends Query<LegacyCreateAircraftResponse> {
  constructor(public readonly aircraftId: string) {
    super();
  }
}

@QueryHandler(LegacyGetAircraftByIdQuery)
export class LegacyGetAircraftByIdHandler implements IQueryHandler<LegacyGetAircraftByIdQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(
    query: LegacyGetAircraftByIdQuery,
  ): Promise<LegacyCreateAircraftResponse> {
    const aircraft = await this.repository.legacyFindOneBy({
      id: query.aircraftId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    return aircraft;
  }
}
