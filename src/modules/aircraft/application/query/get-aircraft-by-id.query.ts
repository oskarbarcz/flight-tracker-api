import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { AircraftRepository } from '../../../operators/repository/aircraft.repository';
import { LegacyCreateAircraftResponse } from '../../../operators/controller/request/aircraft.request';

export class GetAircraftByIdQuery extends Query<LegacyCreateAircraftResponse> {
  constructor(public readonly aircraftId: string) {
    super();
  }
}

@QueryHandler(GetAircraftByIdQuery)
export class GetAircraftByIdHandler implements IQueryHandler<GetAircraftByIdQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(
    query: GetAircraftByIdQuery,
  ): Promise<LegacyCreateAircraftResponse> {
    const aircraft = await this.repository.findOneBy({ id: query.aircraftId });

    if (!aircraft) {
      throw new NotFoundException('Aircraft with given id does not exist.');
    }

    return aircraft;
  }
}
