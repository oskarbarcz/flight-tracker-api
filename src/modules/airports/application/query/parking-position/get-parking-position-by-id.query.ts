import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ParkingPositionsRepository } from '../../../infra/database/parking-positions.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { GetParkingPositionResponse } from '../../../infra/http/request/parking-position.dto';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { ParkingPositionNotFoundError } from '../../../model/error/parking-position.error';
import { ParkingPosition } from '../../../model/parking-position.model';

export class GetParkingPositionByIdQuery extends Query<GetParkingPositionResponse> {
  constructor(
    public readonly airportId: string,
    public readonly parkingPositionId: string,
  ) {
    super();
  }
}

@QueryHandler(GetParkingPositionByIdQuery)
export class GetParkingPositionByIdHandler implements IQueryHandler<GetParkingPositionByIdQuery> {
  constructor(
    private readonly parkingPositionsRepository: ParkingPositionsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(
    query: GetParkingPositionByIdQuery,
  ): Promise<GetParkingPositionResponse> {
    const { airportId, parkingPositionId } = query;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    const parkingPosition = await this.parkingPositionsRepository.findOneBy({
      id: parkingPositionId,
      airportId,
    });

    if (!parkingPosition) {
      throw new ParkingPositionNotFoundError();
    }

    return parkingPosition as ParkingPosition;
  }
}
