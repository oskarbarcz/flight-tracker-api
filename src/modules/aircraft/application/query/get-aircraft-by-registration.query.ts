import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { AircraftRepository } from '../../../operators/repository/aircraft.repository';
import { LegacyCreateAircraftResponse } from '../../../operators/controller/request/aircraft.request';

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
      throw new NotFoundException(
        'Aircraft with given registration does not exist.',
      );
    }

    return aircraft;
  }
}
