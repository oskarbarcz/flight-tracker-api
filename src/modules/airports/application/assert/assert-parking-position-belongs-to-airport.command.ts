import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParkingPositionsRepository } from '../../infra/database/parking-positions.repository';
import { ParkingPositionNotAtAirportError } from '../../model/error/parking-position.error';

export class AssertParkingPositionBelongsToAirportCommand {
  constructor(
    public readonly airportId: string,
    public readonly parkingPositionId: string,
  ) {}
}

@CommandHandler(AssertParkingPositionBelongsToAirportCommand)
export class AssertParkingPositionBelongsToAirportHandler implements ICommandHandler<AssertParkingPositionBelongsToAirportCommand> {
  constructor(
    private readonly parkingPositionsRepository: ParkingPositionsRepository,
  ) {}

  async execute(
    command: AssertParkingPositionBelongsToAirportCommand,
  ): Promise<void> {
    const { airportId, parkingPositionId } = command;
    if (
      !(await this.parkingPositionsRepository.exists(
        airportId,
        parkingPositionId,
      ))
    ) {
      throw new ParkingPositionNotAtAirportError();
    }
  }
}
