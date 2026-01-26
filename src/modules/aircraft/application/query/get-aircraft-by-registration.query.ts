import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { AircraftRepository } from '../../repository/aircraft.repository';
import { CreateAircraftResponse } from '../../dto/create-aircraft.dto';

export class GetAircraftByRegistrationQuery extends Query<CreateAircraftResponse> {
  constructor(public readonly registration: string) {
    super();
  }
}

@QueryHandler(GetAircraftByRegistrationQuery)
export class GetAircraftByRegistrationHandler implements IQueryHandler<GetAircraftByRegistrationQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(
    query: GetAircraftByRegistrationQuery,
  ): Promise<CreateAircraftResponse> {
    const aircraft = await this.repository.findOneBy({
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
