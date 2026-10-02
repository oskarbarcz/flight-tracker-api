import { Query, QueryHandler, IQueryHandler } from '@nestjs/cqrs';
import { ParkingPositionsRepository } from '../../../infra/database/parking-positions.repository';
import { GetParkingPositionResponse } from '../../../infra/http/request/parking-position.dto';
import { ParkingPositionNotFoundError } from '../../../model/error/parking-position.error';
import { ParkingPosition } from '../../../model/parking-position.model';

export class FindParkingPositionQuery extends Query<GetParkingPositionResponse> {
  constructor(public readonly parkingPositionId: string) {
    super();
  }
}

@QueryHandler(FindParkingPositionQuery)
export class FindParkingPositionHandler implements IQueryHandler<FindParkingPositionQuery> {
  constructor(
    private readonly parkingPositionsRepository: ParkingPositionsRepository,
  ) {}

  async execute(
    query: FindParkingPositionQuery,
  ): Promise<GetParkingPositionResponse> {
    const parkingPosition = await this.parkingPositionsRepository.findOneBy({
      id: query.parkingPositionId,
    });

    if (!parkingPosition) {
      throw new ParkingPositionNotFoundError();
    }

    return parkingPosition as ParkingPosition;
  }
}
