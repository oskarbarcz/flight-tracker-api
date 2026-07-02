import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateParkingPositionRequest } from '../../../infra/http/request/parking-position.dto';
import { ParkingPositionsRepository } from '../../../infra/database/parking-positions.repository';
import { TerminalsRepository } from '../../../infra/database/terminals.repository';
import { AirportsRepository } from '../../../infra/database/airports.repository';
import { AirportNotFoundError } from '../../../model/error/airport.error';
import { TerminalNotFoundError } from '../../../model/error/terminal.error';

export class CreateParkingPositionCommand {
  constructor(
    public readonly airportId: string,
    public readonly parkingPositionId: string,
    public readonly data: CreateParkingPositionRequest,
  ) {}
}

@CommandHandler(CreateParkingPositionCommand)
export class CreateParkingPositionHandler implements ICommandHandler<CreateParkingPositionCommand> {
  constructor(
    private readonly parkingPositionsRepository: ParkingPositionsRepository,
    private readonly terminalsRepository: TerminalsRepository,
    private readonly airportsRepository: AirportsRepository,
  ) {}

  async execute(command: CreateParkingPositionCommand): Promise<void> {
    const { airportId, parkingPositionId, data } = command;

    if (!(await this.airportsRepository.exists(airportId))) {
      throw new AirportNotFoundError();
    }

    if (!(await this.terminalsRepository.exists(airportId, data.terminalId))) {
      throw new TerminalNotFoundError();
    }

    await this.parkingPositionsRepository.create(
      airportId,
      parkingPositionId,
      data,
    );
  }
}
