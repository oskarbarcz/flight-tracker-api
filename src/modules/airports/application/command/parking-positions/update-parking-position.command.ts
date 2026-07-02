import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateParkingPositionRequest } from '../../../infra/http/request/parking-position.dto';
import { ParkingPositionsRepository } from '../../../infra/database/parking-positions.repository';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { TerminalNotFoundError } from '../../../model/error/terminal.error';
import { ParkingPositionNotFoundError } from '../../../model/error/parking-position.error';

export class UpdateParkingPositionCommand {
  constructor(
    public readonly airportId: string,
    public readonly parkingPositionId: string,
    public readonly data: UpdateParkingPositionRequest,
  ) {}
}

@CommandHandler(UpdateParkingPositionCommand)
export class UpdateParkingPositionHandler implements ICommandHandler<UpdateParkingPositionCommand> {
  constructor(
    private readonly parkingPositionsRepository: ParkingPositionsRepository,
    private readonly terminalsRepository: TerminalsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: UpdateParkingPositionCommand): Promise<void> {
    const { airportId, parkingPositionId, data } = command;

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

    if (
      data.terminalId !== undefined &&
      !(await this.terminalsRepository.exists(airportId, data.terminalId))
    ) {
      throw new TerminalNotFoundError();
    }

    await this.parkingPositionsRepository.update(parkingPositionId, data);
  }
}
