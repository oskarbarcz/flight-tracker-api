import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ParkingPositionsRepository } from '../../../infra/database/parking-positions.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { GetParkingPositionResponse } from '../../../infra/http/request/parking-position.dto';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { ParkingPosition } from '../../../model/parking-position.model';

export class ListParkingPositionsByAirportQuery extends Query<
  GetParkingPositionResponse[]
> {
  constructor(public readonly airportId: string) {
    super();
  }
}

@QueryHandler(ListParkingPositionsByAirportQuery)
export class ListParkingPositionsByAirportHandler implements IQueryHandler<ListParkingPositionsByAirportQuery> {
  constructor(
    private readonly parkingPositionsRepository: ParkingPositionsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(
    query: ListParkingPositionsByAirportQuery,
  ): Promise<GetParkingPositionResponse[]> {
    if (!(await this.airportsRepository.exists(query.airportId))) {
      throw new AirportNotFoundError();
    }

    const parkingPositions = await this.parkingPositionsRepository.findAll(
      query.airportId,
    );
    return parkingPositions as ParkingPosition[];
  }
}
