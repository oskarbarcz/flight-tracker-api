import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { AircraftRepository } from '../../repository/aircraft.repository';
import { CreateAircraftResponse } from '../../dto/create-aircraft.dto';

export class GetAircraftByIdQuery extends Query<CreateAircraftResponse> {
  constructor(public readonly aircraftId: string) {
    super();
  }
}

@QueryHandler(GetAircraftByIdQuery)
export class GetAircraftByIdHandler implements IQueryHandler<GetAircraftByIdQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(query: GetAircraftByIdQuery): Promise<CreateAircraftResponse> {
    const aircraft = await this.repository.findOneBy({ id: query.aircraftId });

    if (!aircraft) {
      throw new NotFoundException('Aircraft with given id does not exist.');
    }

    return aircraft;
  }
}
