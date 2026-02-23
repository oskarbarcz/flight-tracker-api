import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../../repository/aircraft.repository';
import { LegacyCreateAircraftResponse } from '../../../controller/request/aircraft.request';
import { AircraftWithRegistrationNotFoundError } from '../../../model/error/aircraft.error';

export class GetAircraftByRegistrationQuery extends Query<LegacyCreateAircraftResponse> {
  constructor(public readonly registration: string) {
    super();
  }
}

@QueryHandler(GetAircraftByRegistrationQuery)
export class GetAircraftByRegistrationHandler implements IQueryHandler<GetAircraftByRegistrationQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(
    query: GetAircraftByRegistrationQuery,
  ): Promise<LegacyCreateAircraftResponse> {
    const aircraft = await this.repository.legacyFindOneBy({
      registration: query.registration,
    });

    if (!aircraft) {
      throw new AircraftWithRegistrationNotFoundError();
    }

    return aircraft;
  }
}
