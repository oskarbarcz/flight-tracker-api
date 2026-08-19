import { IQueryHandler, Query, QueryHandler } from '@nestjs/cqrs';
import { AircraftRepository } from '../../infra/database/repository/aircraft.repository';
import { AircraftNotFoundError } from '../../model/error/aircraft.error';

export class GetAircraftCabinLayoutQuery extends Query<string | null> {
  constructor(public readonly aircraftId: string) {
    super();
  }
}

@QueryHandler(GetAircraftCabinLayoutQuery)
export class GetAircraftCabinLayoutHandler implements IQueryHandler<GetAircraftCabinLayoutQuery> {
  constructor(private readonly aircraftRepository: AircraftRepository) {}

  async execute(query: GetAircraftCabinLayoutQuery): Promise<string | null> {
    const aircraft = await this.aircraftRepository.findOneBy({
      id: query.aircraftId,
    });

    if (!aircraft) {
      throw new AircraftNotFoundError();
    }

    return aircraft.layout?.id ?? null;
  }
}
