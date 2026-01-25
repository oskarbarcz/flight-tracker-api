import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { AircraftRepository } from '../../repository/aircraft.repository';
import { CreateAircraftResponse } from '../../dto/create-aircraft.dto';

export class GetAircraftByIcaoCodeQuery extends Query<CreateAircraftResponse> {
  constructor(public readonly icaoCode: string) {
    super();
  }
}

@QueryHandler(GetAircraftByIcaoCodeQuery)
export class GetAircraftByIcaoCodeHandler implements IQueryHandler<GetAircraftByIcaoCodeQuery> {
  constructor(private readonly repository: AircraftRepository) {}

  async execute(
    query: GetAircraftByIcaoCodeQuery,
  ): Promise<CreateAircraftResponse> {
    const aircraft = await this.repository.findOneBy({
      icaoCode: query.icaoCode,
    });

    if (!aircraft) {
      throw new NotFoundException(
        'Aircraft with given ICAO code does not exist.',
      );
    }

    return aircraft;
  }
}
