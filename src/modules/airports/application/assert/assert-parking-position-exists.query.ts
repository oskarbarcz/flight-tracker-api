import { QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { AirportsRepository } from '../../infra/database/airports.repository';
import { ParkingPositionsRepository } from '../../infra/database/parking-positions.repository';
import { AirportNotFoundError } from '../../model/error/airport.error';
import { ParkingPositionNotFoundError } from '../../model/error/parking-position.error';

export class AssertParkingPositionExistsQuery {
  constructor(
    public readonly airportId: string,
    public readonly parkingPositionId: string,
  ) {}
}

@QueryHandler(AssertParkingPositionExistsQuery)
export class AssertParkingPositionExistsHandler implements IQueryHandler<AssertParkingPositionExistsQuery> {
  constructor(
    private readonly airportsRepository: AirportsRepository,
    private readonly parkingPositionsRepository: ParkingPositionsRepository,
  ) {}

  async execute(query: AssertParkingPositionExistsQuery): Promise<void> {
    const { airportId, parkingPositionId } = query;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (
      !(await this.parkingPositionsRepository.exists(
        airportId,
        parkingPositionId,
      ))
    ) {
      throw new ParkingPositionNotFoundError();
    }
  }
}
