import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ParkingPositionsRepository } from '../../../infra/database/parking-positions.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { ParkingPositionNotFoundError } from '../../../model/error/parking-position.error';

export class RemoveParkingPositionCommand {
  constructor(
    public readonly airportId: string,
    public readonly parkingPositionId: string,
  ) {}
}

@CommandHandler(RemoveParkingPositionCommand)
export class RemoveParkingPositionHandler implements ICommandHandler<RemoveParkingPositionCommand> {
  constructor(
    private readonly parkingPositionsRepository: ParkingPositionsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: RemoveParkingPositionCommand): Promise<void> {
    const { airportId, parkingPositionId } = command;

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

    await this.parkingPositionsRepository.remove(parkingPositionId);
  }
}
